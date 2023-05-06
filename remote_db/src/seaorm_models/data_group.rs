use async_graphql::{Context, Enum, InputObject, Object, SimpleObject};
use async_trait::async_trait;
use sea_orm::{
    entity::prelude::*,
    sea_query::{Expr, Func},
    ActiveValue, DatabaseTransaction, DeleteResult, JoinType, QueryOrder, QuerySelect,
    TransactionTrait,
};
use serde::{Deserialize, Serialize};

use crate::{
    user_models::{mbe_group, mbe_group_members},
    SeaOrmPool,
};

use super::{
    common_add_id_and_data_group_filters, common_add_ordering,
    graphql_schema::{
        extract_session, DataGroupAccessGuard, DeleteOptions, FetchOptions, Filter, OrderingOptions,
    },
    GetEntityDataGroupColumnTrait, GetEntityId, QueryDatabase, QueryResults, RowsDeleted,
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
    pub id_mbe_group: i32,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(has_many = "super::article::Entity")]
    Article,
    #[sea_orm(has_many = "super::buyer::Entity")]
    Buyer,
    #[sea_orm(has_many = "super::cell::Entity")]
    Cell,
    #[sea_orm(has_many = "super::cell_culture_pair::Entity")]
    CellCulturePair,
    #[sea_orm(has_many = "super::culture::Entity")]
    Culture,
    #[sea_orm(has_many = "super::dispatch_note::Entity")]
    DispatchNote,
    #[sea_orm(has_many = "super::dispatch_note_article::Entity")]
    DispatchNoteArticle,
    #[sea_orm(has_many = "super::entry::Entity")]
    Entry,
    #[sea_orm(
        belongs_to = "crate::user_models::mbe_group::Entity",
        from = "Column::IdMbeGroup",
        to = "crate::user_models::mbe_group::Column::Id",
        on_update = "NoAction",
        on_delete = "NoAction"
    )]
    MbeGroup,
}

impl Related<super::article::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Article.def()
    }
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

impl Related<super::dispatch_note::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::DispatchNote.def()
    }
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

impl Related<crate::user_models::mbe_group::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::MbeGroup.def()
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

#[allow(clippy::derivable_impls)]
impl Default for Column {
    fn default() -> Self {
        Column::Id
    }
}

impl GetEntityDataGroupColumnTrait<Column> for Entity {
    fn get_data_group_column() -> Column {
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
    pub id_mbe_group: i32,
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

    type FilterValueType = String;

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
            id_mbe_group: ActiveValue::Set(options.id_mbe_group),
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
        let column: Self::Column = filter.field.into();
        match filter.field {
            DataGroupFields::Name | DataGroupFields::Description => query.filter(
                Expr::expr(Func::lower(Expr::col((Entity, column))))
                    .like(format!("%{}%", filter.value.trim().to_lowercase())),
            ),
            DataGroupFields::Id => query,
        }
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
    async fn data_groups(&self, ctx: &Context<'_>) -> Result<Vec<Model>> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");

        let session_data = extract_session(ctx)?;

        let transaction = db.begin().await?;

        let res = Entity::find()
            .inner_join(mbe_group::Entity)
            .join(
                JoinType::InnerJoin,
                mbe_group_members::Relation::MbeGroup.def().rev(),
            )
            .filter(mbe_group_members::Column::IdMbeUser.eq(session_data.user_id))
            .order_by_asc(Column::Id)
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

    // TODO: Update accordingy for group use
    #[graphql(guard = "DataGroupAccessGuard::new(options.id)")]
    async fn update_data_group(
        &self,
        ctx: &Context<'_>,
        options: DataGroupUpdateOptions,
    ) -> Result<Model> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");
        Entity::update_entity(db, options).await
    }

    // TODO: Update accordingy for group use
    #[graphql(guard = "DataGroupAccessGuard::new(options.id)")]
    async fn delete_data_group(
        &self,
        ctx: &Context<'_>,
        options: DeleteOptions,
    ) -> Result<RowsDeleted> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");
        Entity::delete_entity(db, options).await
    }
}

impl GetEntityId<Column> for Entity {
    fn get_id_column() -> Column {
        Column::Id
    }
}
