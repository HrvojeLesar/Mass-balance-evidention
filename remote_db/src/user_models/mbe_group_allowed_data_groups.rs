use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

use crate::seaorm_models::data_group;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "mbe_group_allowed_data_groups")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id_mbe_group: i32,
    #[sea_orm(primary_key, auto_increment = false)]
    pub d_group: i32,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "crate::seaorm_models::data_group::Entity",
        from = "Column::DGroup",
        to = "crate::seaorm_models::data_group::Column::Id",
        on_update = "NoAction",
        on_delete = "NoAction"
    )]
    DataGroup,
    #[sea_orm(
        belongs_to = "super::mbe_group::Entity",
        from = "Column::IdMbeGroup",
        to = "super::mbe_group::Column::Id",
        on_update = "NoAction",
        on_delete = "NoAction"
    )]
    MbeGroup,
}

impl Related<data_group::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::DataGroup.def()
    }
}

impl Related<super::mbe_group::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::MbeGroup.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
