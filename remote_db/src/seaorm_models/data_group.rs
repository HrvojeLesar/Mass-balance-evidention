use async_graphql::{Context, Enum, InputObject, Object, SimpleObject};
use async_trait::async_trait;
use sea_orm::{
    entity::prelude::*, ActiveValue, DatabaseTransaction, DeleteResult, TransactionTrait,
};
use serde::{Deserialize, Serialize};

use crate::SeaOrmPool;

use super::{
    common_add_filter, common_add_id_and_data_group_filters, common_add_ordering,
    graphql_schema::{DeleteOptions, FetchOptions, Filter, OrderingOptions},
    GetDataGroupColumnTrait, QueryDatabase, QueryResults, RowsDeleted,
};
use anyhow::Result;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize, SimpleObject)]
#[sea_orm(table_name = "data_group")]
#[graphql(name = "DataGroup")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub name: String,
    #[sea_orm(column_type = "Text", nullable)]
    pub description: Option<String>,
    pub created_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(has_many = "super::buyer::Entity")]
    Buyer,
    #[sea_orm(has_many = "super::cell::Entity")]
    Cell,
    #[sea_orm(has_many = "super::cell_culture_pair::Entity")]
    CellCulturePair,
    #[sea_orm(has_many = "super::culture::Entity")]
    Culture,
    #[sea_orm(has_many = "super::entry::Entity")]
    Entry,
}

impl Related<super::buyer::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Buyer.def()
    }
}

impl Related<super::cell::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Cell.def()
    }
}

impl Related<super::cell_culture_pair::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::CellCulturePair.def()
    }
}

impl Related<super::culture::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Culture.def()
    }
}

impl Related<super::entry::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Entry.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}

#[derive(Enum, Clone, Copy, PartialEq, Eq)]
pub enum DataGroupFields {
    Id,
    Name,
    Description,
}

impl From<DataGroupFields> for Column {
    fn from(fields: DataGroupFields) -> Self {
        match fields {
            DataGroupFields::Id => Column::Id,
            DataGroupFields::Name => Column::Name,
            DataGroupFields::Description => Column::Description,
        }
    }
}

impl Default for Column {
    fn default() -> Self {
        Column::Id
    }
}

impl GetDataGroupColumnTrait<Column> for Entity {
    fn get_data_group_column() -> Column {
        Column::Id
    }
    fn get_id_column() -> Column {
        Column::Id
    }
}

#[derive(InputObject)]
pub struct DataGroupUpdateOptions {
    pub id: i32,
    pub name: Option<String>,
    pub description: Option<String>,
}

#[derive(InputObject, Serialize, Deserialize)]
pub struct DataGroupInsertOptions {
    pub name: String,
    pub description: Option<String>,
}

#[async_trait]
impl QueryDatabase for Entity {
    type InnerQueryResultType = Model;

    type QueryResultType = QueryResults<Self::InnerQueryResultType>;

    type FetchModel = Model;

    type InsertOptions = DataGroupInsertOptions;

    type UpdateOptions = DataGroupUpdateOptions;

    type InputFields = DataGroupFields;

    type DeleteOptionsType = i32;

    type FetchIdType = Option<i32>;

    async fn delete_query(
        transaction: &DatabaseTransaction,
        options: DeleteOptions<Self::DeleteOptionsType>,
    ) -> Result<DeleteResult> {
        Ok(Self::delete_by_id(options.id).exec(transaction).await?)
    }

    fn add_id_and_data_group_filters(
        query: Select<Self>,
        fetch_options: &FetchOptions<Self::InputFields, Self::FetchIdType>,
    ) -> Select<Self> {
        common_add_id_and_data_group_filters(query, fetch_options)
    }

    async fn update_entity(
        db: &DatabaseConnection,
        options: Self::UpdateOptions,
    ) -> Result<Self::InnerQueryResultType> {
        let model = ActiveModel {
            id: ActiveValue::Set(options.id),
            name: options.name.map_or(ActiveValue::NotSet, ActiveValue::Set),
            description: options
                .description
                .map_or(ActiveValue::NotSet, |val| ActiveValue::Set(Some(val))),
            ..Default::default()
        };
        let transaction = db.begin().await?;
        let res = Entity::update(model).exec(&transaction).await?;
        transaction.commit().await?;

        Ok(res)
    }

    async fn insert_entity(
        db: &DatabaseConnection,
        options: Self::InsertOptions,
    ) -> Result<Self::InnerQueryResultType> {
        let model = ActiveModel {
            name: ActiveValue::Set(options.name),
            description: ActiveValue::Set(options.description),
            ..Default::default()
        };
        let transaction = db.begin().await?;
        let res = Entity::insert(model)
            .exec_with_returning(&transaction)
            .await?;
        transaction.commit().await?;
        Ok(res)
    }

    fn add_filter(query: Select<Self>, filter: Filter<Self::InputFields>) -> Select<Self> {
        common_add_filter(query, filter)
    }

    fn add_ordering(
        query: Select<Self>,
        ordering_options: Option<OrderingOptions<Self::InputFields>>,
    ) -> Select<Self> {
        common_add_ordering(query, ordering_options)
    }
}

#[derive(Default)]
pub struct DataGroupQuery;

#[Object]
impl DataGroupQuery {
    async fn data_groups(
        &self,
        ctx: &Context<'_>,
        options: FetchOptions<DataGroupFields>,
    ) -> Result<Vec<Model>> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");
        let mut query = Entity::get_query();

        query = Entity::add_id_and_data_group_filters(query, &options);
        query = Entity::add_ordering(query, options.ordering);
        query = Entity::add_filters(query, options.filters);

        let transaction = db.begin().await?;

        let res = query
            .into_model::<<Entity as QueryDatabase>::FetchModel>()
            .all(&transaction)
            .await?;

        transaction.commit().await?;

        Ok(res)
    }
}

#[derive(Default)]
pub struct DataGroupMutation;

#[Object]
impl DataGroupMutation {
    async fn insert_data_group(
        &self,
        ctx: &Context<'_>,
        options: DataGroupInsertOptions,
    ) -> Result<Model> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");
        Entity::insert_entity(db, options).await
    }

    async fn update_data_group(
        &self,
        ctx: &Context<'_>,
        options: DataGroupUpdateOptions,
    ) -> Result<Model> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");
        Entity::update_entity(db, options).await
    }

    async fn delete_data_group(
        &self,
        ctx: &Context<'_>,
        options: DeleteOptions,
    ) -> Result<RowsDeleted> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");
        Entity::delete_entity(db, options).await
    }
}
