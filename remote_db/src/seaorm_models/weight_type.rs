use anyhow::Result;
use async_graphql::{Context, Enum, InputObject, Object, SimpleObject};
use async_trait::async_trait;
use sea_orm::{
    entity::prelude::*,
    sea_query::{Expr, Func},
    ActiveValue, DatabaseTransaction, DeleteResult, TransactionTrait,
};
use serde::{Deserialize, Serialize};

use crate::{
    seaorm_models::graphql_schema::{extract_session, DataGroupAccessGuard},
    user_models::mbe_groups_weight_types,
    SeaOrmPool,
};

use super::{
    common_add_id_and_data_group_filters, common_add_ordering,
    graphql_schema::{
        DeleteOptions, FetchOptions, Filter, MbeGroupAccessGuard, OrderingOptions, QueryResults,
    },
    GetEntityDataGroupColumnTrait, QueryDatabase,
};

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

#[derive(Enum, Clone, Copy, PartialEq, Eq)]
pub enum WeightTypeFields {
    Id,
    UnitShort,
    Unit,
}

impl From<WeightTypeFields> for Column {
    fn from(fields: WeightTypeFields) -> Self {
        match fields {
            WeightTypeFields::Id => Column::Id,
            WeightTypeFields::UnitShort => Column::UnitShort,
            WeightTypeFields::Unit => Column::Unit,
        }
    }
}

#[allow(clippy::derivable_impls)]
impl Default for Column {
    fn default() -> Self {
        Column::Id
    }
}

#[derive(InputObject)]
pub struct WeightTypeInsertOptions {
    pub id: i32,
    pub unit_short: String,
    pub unit: String,
    pub mbe_group: i32,
}

pub struct WeightTypeInsertOptionsExt {
    weight_type_insert_options: WeightTypeInsertOptions,
    created_by: i32,
}

#[derive(InputObject)]
pub struct WeightTypeUpdateOptions {
    pub id: i32,
    pub unit_short: Option<String>,
    pub unit: Option<String>,
}

#[async_trait]
impl QueryDatabase for Entity {
    type InnerQueryResultType = Model;

    type QueryResultType = QueryResults<Self::InnerQueryResultType>;

    type FetchModel = Model;

    type InsertOptions = WeightTypeInsertOptionsExt;

    type UpdateOptions = WeightTypeUpdateOptions;

    type InputFields = WeightTypeFields;

    type DeleteOptionsType = i32;

    type FetchIdType = Option<i32>;

    type FilterValueType = String;

    async fn delete_query(
        transaction: &DatabaseTransaction,
        options: DeleteOptions<Self::DeleteOptionsType>,
    ) -> Result<DeleteResult> {
        Ok(Self::delete_by_id(options.id).exec(transaction).await?)
    }

    fn add_ordering(
        query: Select<Self>,
        ordering_options: Option<OrderingOptions<Self::InputFields>>,
    ) -> Select<Self> {
        common_add_ordering(query, ordering_options)
    }

    fn add_id_and_data_group_filters(
        mut query: Select<Self>,
        fetch_options: &FetchOptions<Self::InputFields, Self::FetchIdType>,
    ) -> Select<Self> {
        if let Some(id) = fetch_options.id {
            query = query.filter(Column::Id.eq(id));
        }
        query
    }

    fn add_filter(query: Select<Self>, filter: Filter<Self::InputFields>) -> Select<Self> {
        let column: Self::Column = filter.field.into();
        match filter.field {
            WeightTypeFields::UnitShort | WeightTypeFields::Unit => query.filter(
                Expr::expr(Func::lower(Expr::col((Entity, column))))
                    .like(format!("%{}%", filter.value.trim().to_lowercase())),
            ),
            WeightTypeFields::Id => query,
        }
    }

    async fn update_entity(
        db: &DatabaseConnection,
        options: Self::UpdateOptions,
    ) -> Result<Self::InnerQueryResultType> {
        let model = ActiveModel {
            id: ActiveValue::Set(options.id),
            unit_short: options
                .unit_short
                .map_or(ActiveValue::NotSet, ActiveValue::Set),
            unit: options.unit.map_or(ActiveValue::NotSet, ActiveValue::Set),
            ..Default::default()
        };

        let transaction = db.begin().await?;

        let res = model.insert(&transaction).await?;

        transaction.commit().await?;

        Ok(res)
    }

    async fn insert_entity(
        db: &DatabaseConnection,
        options: Self::InsertOptions,
    ) -> Result<Self::InnerQueryResultType> {
        let model = ActiveModel {
            unit: ActiveValue::Set(options.weight_type_insert_options.unit),
            unit_short: ActiveValue::Set(options.weight_type_insert_options.unit_short),
            ..Default::default()
        };

        let transaction = db.begin().await?;

        let res = model.insert(&transaction).await?;

        mbe_groups_weight_types::ActiveModel {
            id_weight_type: ActiveValue::Set(res.id),
            id_mbe_group: ActiveValue::Set(options.weight_type_insert_options.mbe_group),
            id_created_by: ActiveValue::Set(options.created_by),
            ..Default::default()
        }
        .insert(&transaction)
        .await?;

        transaction.commit().await?;
        Ok(res)
    }
}

#[derive(Default)]
pub struct WeightTypeQuery;

#[Object]
impl WeightTypeQuery {
    #[graphql(guard = "DataGroupAccessGuard::new(options.d_group)")]
    async fn weight_types(
        &self,
        ctx: &Context<'_>,
        options: FetchOptions<WeightTypeFields>,
    ) -> Result<QueryResults<Model>> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");
        Entity::fetch(db, options).await
    }
}

#[derive(Default)]
pub struct WeightTypeMutation;

#[Object]
impl WeightTypeMutation {
    #[graphql(guard = "MbeGroupAccessGuard::new(options.mbe_group)")]
    async fn insert_weight_types(
        &self,
        ctx: &Context<'_>,
        options: WeightTypeInsertOptions,
    ) -> Result<Model> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");
        let user_session = extract_session(ctx)?;
        Entity::insert_entity(
            db,
            WeightTypeInsertOptionsExt {
                weight_type_insert_options: options,
                created_by: user_session.user_id,
            },
        )
        .await
    }
}
