use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "mbe_group")]
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
