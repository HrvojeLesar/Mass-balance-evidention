use async_graphql::{Context, Enum, InputObject, Object, SimpleObject};
use async_trait::async_trait;
use sea_orm::{
    entity::prelude::*,
    sea_query::{Expr, Func},
    ActiveValue, DatabaseTransaction, DeleteResult, TransactionTrait,
};
use serde::{Deserialize, Serialize};

use crate::SeaOrmPool;

use super::{
    common_add_id_and_data_group_filters, common_add_ordering,
    graphql_schema::{
        DataGroupAccessGuard, DeleteOptions, FetchOptions, Filter, OrderingOptions, QueryResults,
        UpdateDeleteGuard,
    },
    GetDataGroupColumnTrait, GetEntityDataGroupId, GetEntityId, QueryDatabase, RowsDeleted,
};

use anyhow::Result;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize, SimpleObject)]
#[sea_orm(table_name = "article")]
#[graphql(name = "Article")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub name: String,
    #[sea_orm(column_type = "Text", nullable)]
    pub description: Option<String>,
    pub created_at: DateTimeWithTimeZone,
    pub d_group: i32,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::data_group::Entity",
        from = "Column::DGroup",
        to = "super::data_group::Column::Id",
        on_update = "NoAction",
        on_delete = "NoAction"
    )]
    DataGroup,
    #[sea_orm(has_many = "super::dispatch_note_article::Entity")]
    DispatchNoteArticle,
}

impl Related<super::data_group::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::DataGroup.def()
    }
}

impl Related<super::dispatch_note_article::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::DispatchNoteArticle.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}

#[derive(Enum, Clone, Copy, PartialEq, Eq)]
pub enum ArticleFields {
    Id,
    Name,
    Description,
}

impl From<ArticleFields> for Column {
    fn from(fields: ArticleFields) -> Self {
        match fields {
            ArticleFields::Id => Column::Id,
            ArticleFields::Name => Column::Name,
            ArticleFields::Description => Column::Description,
        }
    }
}

#[allow(clippy::derivable_impls)]
impl Default for Column {
    fn default() -> Self {
        Column::Id
    }
}

impl GetDataGroupColumnTrait<Column> for Entity {
    fn get_data_group_column() -> Column {
        Column::DGroup
    }
    fn get_id_column() -> Column {
        Column::Id
    }
}

#[derive(InputObject)]
pub struct ArticleUpdateOptions {
    pub id: i32,
    pub name: Option<String>,
    pub description: Option<String>,
}

#[derive(InputObject, Serialize, Deserialize)]
pub struct ArticleInsertOptions {
    pub name: String,
    pub description: Option<String>,
    pub d_group: i32,
}

#[async_trait]
impl QueryDatabase for Entity {
    type InnerQueryResultType = Model;

    type QueryResultType = QueryResults<Self::InnerQueryResultType>;

    type FetchModel = Model;

    type InsertOptions = ArticleInsertOptions;

    type UpdateOptions = ArticleUpdateOptions;

    type InputFields = ArticleFields;

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
        query: Select<Self>,
        fetch_options: &FetchOptions<Self::InputFields, Self::FetchIdType>,
    ) -> Select<Self> {
        common_add_id_and_data_group_filters(query, fetch_options)
    }

    fn add_filter(query: Select<Self>, filter: Filter<Self::InputFields>) -> Select<Self> {
        let column: Self::Column = filter.field.into();
        match filter.field {
            ArticleFields::Name | ArticleFields::Description => query.filter(
                Expr::expr(Func::lower(Expr::col((Entity, column))))
                    .like(format!("%{}%", filter.value.trim().to_lowercase())),
            ),
            ArticleFields::Id => query,
        }
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
            d_group: ActiveValue::Set(options.d_group),
            ..Default::default()
        };
        let transaction = db.begin().await?;
        let res = Entity::insert(model)
            .exec_with_returning(&transaction)
            .await?;
        transaction.commit().await?;
        Ok(res)
    }
}

#[derive(Default)]
pub struct ArticleQuery;

#[Object]
impl ArticleQuery {
    #[graphql(guard = "DataGroupAccessGuard::new(options.d_group)")]
    async fn articles(
        &self,
        ctx: &Context<'_>,
        options: FetchOptions<ArticleFields>,
    ) -> Result<QueryResults<Model>> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");
        Entity::fetch(db, options).await
    }
}

#[derive(Default)]
pub struct ArticleMutation;

#[Object]
impl ArticleMutation {
    #[graphql(guard = "DataGroupAccessGuard::new(options.d_group)")]
    async fn insert_article(
        &self,
        ctx: &Context<'_>,
        options: ArticleInsertOptions,
    ) -> Result<Model> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");
        Entity::insert_entity(db, options).await
    }

    #[graphql(guard = "UpdateDeleteGuard::<Entity>::new(options.id)")]
    async fn update_article(
        &self,
        ctx: &Context<'_>,
        options: ArticleUpdateOptions,
    ) -> Result<Model> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");
        Entity::update_entity(db, options).await
    }

    #[graphql(guard = "UpdateDeleteGuard::<Entity>::new(options.id)")]
    async fn delete_article(
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

impl GetEntityDataGroupId for Model {
    fn get_data_group_id(&self) -> i32 {
        self.d_group
    }
}
