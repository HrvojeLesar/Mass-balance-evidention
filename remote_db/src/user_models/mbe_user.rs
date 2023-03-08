use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "mbe_user")]
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
