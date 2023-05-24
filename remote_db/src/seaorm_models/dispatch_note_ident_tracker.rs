use anyhow::{anyhow, Result};
use async_graphql::{Context, InputObject, Object, SimpleObject};
use sea_orm::{entity::prelude::*, ActiveValue, TransactionTrait};
use serde::{Deserialize, Serialize};

use crate::SeaOrmPool;

use super::graphql_schema::DataGroupAccessGuard;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize, SimpleObject)]
#[sea_orm(table_name = "dispatch_note_ident_tracker")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id_data_group: i32,
    pub identifier: i32,
    pub created_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::data_group::Entity",
        from = "Column::IdDataGroup",
        to = "super::data_group::Column::Id",
        on_update = "NoAction",
        on_delete = "NoAction"
    )]
    DataGroup,
}

impl Related<super::data_group::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::DataGroup.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}

#[derive(InputObject)]
struct DispatchNoteIdentFetchOptions {
    id_data_group: i32,
}

#[derive(InputObject)]
struct DispatchNoteIdentUpdateOptions {
    id_data_group: i32,
    identifier: i32,
}

#[derive(Default)]
pub struct DispatchNoteIdentTrackerQuery;

#[Object]
impl DispatchNoteIdentTrackerQuery {
    async fn dispatch_note_ident(
        &self,
        ctx: &Context<'_>,
        options: DispatchNoteIdentFetchOptions,
    ) -> Result<Model> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");

        let transaction = db.begin().await?;

        let res = Entity::find()
            .filter(Column::IdDataGroup.eq(options.id_data_group))
            .one(&transaction)
            .await?
            .ok_or_else(|| anyhow!("DispatchNoteIdentTracker not found"))?;

        transaction.commit().await?;

        Ok(res)
    }
}

#[derive(Default)]
pub struct DispatchNoteIdentTrackerMutation;

#[Object]
impl DispatchNoteIdentTrackerMutation {
    #[graphql(guard = "DataGroupAccessGuard::new(options.id_data_group)")]
    async fn update_dispatch_note_ident(
        &self,
        ctx: &Context<'_>,
        options: DispatchNoteIdentUpdateOptions,
    ) -> Result<Model> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");

        let model = ActiveModel {
            id_data_group: ActiveValue::Set(options.id_data_group),
            identifier: ActiveValue::Set(options.identifier),
            ..Default::default()
        };

        let transaction = db.begin().await?;

        let res = model.update(&transaction).await?;

        transaction.commit().await?;

        Ok(res)
    }
}
