use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
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
