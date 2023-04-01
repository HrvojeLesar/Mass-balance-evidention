use anyhow::Result;
use async_graphql::{Context, InputObject, Object, SimpleObject};
use sea_orm::{entity::prelude::*, ActiveValue, TransactionTrait};
use serde::{Deserialize, Serialize};

use crate::{seaorm_models::graphql_schema::extract_session, SeaOrmPool};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize, SimpleObject)]
#[sea_orm(table_name = "mbe_user")]
#[graphql(name = "MbeUser")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    #[sea_orm(column_type = "Text")]
    pub email: String,
    pub created_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(has_many = "super::mbe_group::Entity")]
    MbeGroup,
}

impl Related<super::mbe_group::Entity> for Entity {
    fn to() -> RelationDef {
        super::mbe_group_members::Relation::MbeGroup.def()
    }
    fn via() -> Option<RelationDef> {
        Some(super::mbe_group_members::Relation::MbeUser.def().rev())
    }
}

impl ActiveModelBehavior for ActiveModel {}

#[derive(InputObject)]
struct MbeUserInsertOptions {
    email: String,
}

#[derive(Default)]
pub struct MbeUserMutation;

#[Object]
impl MbeUserMutation {
    async fn insert_mbe_user(
        &self,
        ctx: &Context<'_>,
        options: MbeUserInsertOptions,
    ) -> Result<Model> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");
        let _session_data = extract_session(ctx)?;

        let model = ActiveModel {
            email: ActiveValue::Set(options.email.to_lowercase()),
            ..Default::default()
        };

        let transaction = db.begin().await?;

        let res = Entity::insert(model)
            .exec_with_returning(&transaction)
            .await?;

        transaction.commit().await?;

        Ok(res)
    }
}
