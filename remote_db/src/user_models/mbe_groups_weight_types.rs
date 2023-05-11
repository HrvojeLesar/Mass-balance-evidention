use anyhow::Result;
use async_graphql::{Context, InputObject, Object, SimpleObject};
use sea_orm::{
    entity::prelude::*, ActiveValue, DatabaseTransaction, DeleteResult, TransactionTrait,
};
use serde::{Deserialize, Serialize};

use crate::{
    seaorm_models::{
        graphql_schema::{extract_session, MbeGroupAccessGuard},
        RowsDeleted,
    },
    SeaOrmPool,
};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize, SimpleObject)]
#[sea_orm(table_name = "mbe_groups_weight_types")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id_weight_type: i32,
    #[sea_orm(primary_key, auto_increment = false)]
    pub id_created_by: i32,
    #[sea_orm(primary_key, auto_increment = false)]
    pub id_mbe_group: i32,
    pub created_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::mbe_group::Entity",
        from = "Column::IdMbeGroup",
        to = "super::mbe_group::Column::Id",
        on_update = "NoAction",
        on_delete = "Cascade"
    )]
    MbeGroup,
    #[sea_orm(
        belongs_to = "super::mbe_user::Entity",
        from = "Column::IdCreatedBy",
        to = "super::mbe_user::Column::Id",
        on_update = "NoAction",
        on_delete = "NoAction"
    )]
    MbeUser,
    #[sea_orm(
        belongs_to = "crate::seaorm_models::weight_type::Entity",
        from = "Column::IdWeightType",
        to = "crate::seaorm_models::weight_type::Column::Id",
        on_update = "NoAction",
        on_delete = "NoAction"
    )]
    WeightType,
}

impl Related<super::mbe_group::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::MbeGroup.def()
    }
}

impl Related<super::mbe_user::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::MbeUser.def()
    }
}

impl Related<crate::seaorm_models::weight_type::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::WeightType.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}

struct MbeGroupsWeightTypesOptionsExt {
    id_mbe_group: i32,
    id_created_by: i32,
    id_weight_type: i32,
}

#[derive(InputObject)]
pub struct MbeGroupWeightTypesOptions {
    pub id_weight_type: i32,
    pub id_mbe_group: i32,
}

impl Entity {
    async fn add_weight_to_group(
        transaction: &DatabaseTransaction,
        options: MbeGroupsWeightTypesOptionsExt,
    ) -> Result<Model, DbErr> {
        let model = ActiveModel {
            id_weight_type: ActiveValue::Set(options.id_weight_type),
            id_created_by: ActiveValue::Set(options.id_created_by),
            id_mbe_group: ActiveValue::Set(options.id_mbe_group),
            ..Default::default()
        };

        model.insert(transaction).await
    }

    async fn remove_weight_from_group(
        transaction: &DatabaseTransaction,
        options: MbeGroupsWeightTypesOptionsExt,
    ) -> Result<DeleteResult, DbErr> {
        let model = ActiveModel {
            id_weight_type: ActiveValue::Set(options.id_weight_type),
            id_created_by: ActiveValue::Set(options.id_created_by),
            id_mbe_group: ActiveValue::Set(options.id_mbe_group),
            ..Default::default()
        };

        model.delete(transaction).await
    }
}

#[derive(Default)]
pub struct MbeGroupsWeightTypeMutation;

#[Object]
impl MbeGroupsWeightTypeMutation {
    #[graphql(guard = "MbeGroupAccessGuard::new(options.id_mbe_group)")]
    async fn insert_weight_type_into_group(
        &self,
        ctx: &Context<'_>,
        options: MbeGroupWeightTypesOptions,
    ) -> Result<Model> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");
        let user_session = extract_session(ctx)?;

        let transaction = db.begin().await?;

        let res = Entity::add_weight_to_group(
            &transaction,
            MbeGroupsWeightTypesOptionsExt {
                id_mbe_group: options.id_mbe_group,
                id_created_by: user_session.user_id,
                id_weight_type: options.id_weight_type,
            },
        )
        .await?;

        transaction.commit().await?;

        Ok(res)
    }

    #[graphql(guard = "MbeGroupAccessGuard::new(options.id_mbe_group)")]
    async fn remove_weight_type_from_group(
        &self,
        ctx: &Context<'_>,
        options: MbeGroupWeightTypesOptions,
    ) -> Result<RowsDeleted> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");
        let user_session = extract_session(ctx)?;

        let transaction = db.begin().await?;

        let res = Entity::remove_weight_from_group(
            &transaction,
            MbeGroupsWeightTypesOptionsExt {
                id_mbe_group: options.id_mbe_group,
                id_created_by: user_session.user_id,
                id_weight_type: options.id_weight_type,
            },
        )
        .await?;

        transaction.commit().await?;

        Ok(res.into())
    }
}
