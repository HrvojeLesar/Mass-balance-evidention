use async_graphql::SimpleObject;
use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize, SimpleObject)]
#[graphql(name = "WeightType")]
#[sea_orm(table_name = "weight_type")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub unit_short: String,
    pub unit: String,
    pub created_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(has_many = "super::dispatch_note_article::Entity")]
    DispatchNoteArticle,
    #[sea_orm(has_many = "super::entry::Entity")]
    Entry,
    #[sea_orm(has_many = "crate::user_models::mbe_groups_weight_types::Entity")]
    MbeGroupsWeightTypes,
}

impl Related<super::dispatch_note_article::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::DispatchNoteArticle.def()
    }
}

impl Related<super::entry::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Entry.def()
    }
}

impl Related<crate::user_models::mbe_groups_weight_types::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::MbeGroupsWeightTypes.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
