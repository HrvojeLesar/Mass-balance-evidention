use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "mbe_group_members")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id_mbe_user: i32,
    #[sea_orm(primary_key, auto_increment = false)]
    pub id_mbe_group: i32,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::mbe_group::Entity",
        from = "Column::IdMbeGroup",
        to = "super::mbe_group::Column::Id",
        on_update = "NoAction",
        on_delete = "NoAction"
    )]
    MbeGroup,
    #[sea_orm(
        belongs_to = "super::mbe_user::Entity",
        from = "Column::IdMbeUser",
        to = "super::mbe_user::Column::Id",
        on_update = "NoAction",
        on_delete = "NoAction"
    )]
    MbeUser,
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

impl ActiveModelBehavior for ActiveModel {}
