use anyhow::Result;
use async_graphql::{Context, InputObject, Object, SimpleObject};
use sea_orm::{entity::prelude::*, ActiveValue, DbBackend, Statement, TransactionTrait};
use serde::{Deserialize, Serialize};

use crate::{seaorm_models::graphql_schema::extract_session, SeaOrmPool};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize, SimpleObject)]
#[sea_orm(table_name = "mbe_group")]
#[graphql(name = "MbeGroup")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub name: String,
    pub owner: i32,
    pub created_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(has_many = "crate::seaorm_models::data_group::Entity")]
    DataGroup,
    #[sea_orm(
        belongs_to = "super::mbe_user::Entity",
        from = "Column::Owner",
        to = "super::mbe_user::Column::Id",
        on_update = "NoAction",
        on_delete = "NoAction"
    )]
    MbeUser,
}

impl Related<crate::seaorm_models::data_group::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::DataGroup.def()
    }
}

impl Related<super::mbe_user::Entity> for Entity {
    fn to() -> RelationDef {
        super::mbe_group_members::Relation::MbeUser.def()
    }
    fn via() -> Option<RelationDef> {
        Some(super::mbe_group_members::Relation::MbeGroup.def().rev())
    }
}

impl ActiveModelBehavior for ActiveModel {}

#[derive(InputObject)]
struct MbeGroupInsertOptions {
    name: String,
}

#[derive(Default)]
pub struct MbeGroupQuery;

#[Object]
impl MbeGroupQuery {
    async fn mbe_groups(&self, ctx: &Context<'_>) -> Result<Vec<Model>> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");
        let session_data = extract_session(ctx)?;

        let transaction = db.begin().await?;

        let res = Entity::find()
            .from_raw_sql(Statement::from_sql_and_values(
                DbBackend::Postgres,
                r#"
                SELECT 
                    "mbe_group"."id", 
                    "mbe_group"."name",
                    "mbe_group"."owner",
                    "mbe_group"."created_at" 
                FROM "mbe_group"
                WHERE "mbe_group"."owner" = $1
                UNION
                SELECT 
                    "mbe_group"."id", 
                    "mbe_group"."name",
                    "mbe_group"."owner",
                    "mbe_group"."created_at" 
                FROM "mbe_group"
                INNER JOIN "mbe_group_members" ON "mbe_group"."id" = "mbe_group_members"."id_mbe_group"
                WHERE "mbe_group_members"."id_mbe_user" = $1
                ORDER BY id
                "#,
                [session_data.user_id.into()],
            ))
            .into_model::<Model>()
            .all(&transaction)
            .await?;

        transaction.commit().await?;

        Ok(res)
    }
}

#[derive(Default)]
pub struct MbeGroupMutation;

#[Object]
impl MbeGroupMutation {
    async fn insert_mbe_group(
        &self,
        ctx: &Context<'_>,
        options: MbeGroupInsertOptions,
    ) -> Result<Model> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");
        let session_data = extract_session(ctx)?;

        let model = ActiveModel {
            name: ActiveValue::Set(options.name),
            owner: ActiveValue::Set(session_data.user_id),
            ..Default::default()
        };

        let transaction = db.begin().await?;

        let res = Entity::insert(model)
            .exec_with_returning(&transaction)
            .await?;

        let group_member_model = super::mbe_group_members::ActiveModel {
            id_mbe_user: ActiveValue::Set(session_data.user_id),
            id_mbe_group: ActiveValue::Set(res.id),
        };

        let _inserted_group_member_res =
            super::mbe_group_members::Entity::insert(group_member_model)
                .exec_with_returning(&transaction)
                .await?;

        transaction.commit().await?;

        Ok(res)
    }
}
