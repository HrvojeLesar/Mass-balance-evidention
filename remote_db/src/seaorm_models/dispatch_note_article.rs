use async_graphql::{Context, Enum, InputObject, Object, SimpleObject};
use async_trait::async_trait;

use sea_orm::{
    entity::prelude::*,
    sea_query::{Expr, Func},
    ActiveValue, DatabaseTransaction, DeleteResult, FromQueryResult, Order, QueryOrder,
    QuerySelect, TransactionTrait,
};
use serde::{Deserialize, Serialize};

use crate::SeaOrmPool;

use super::{
    graphql_schema::{
        DataGroupAccessGuard, DeleteOptions, FetchOptions, Filter, OrderingOptions, Pagination,
        QueryResults, UpdateDeleteGuard,
    },
    GetEntityDataGroupColumnTrait, GetEntityDataGroupId, GetEntityId, QueryDatabase,
    QueryResultsHelperType, RowsDeleted,
};

use anyhow::{anyhow, Result};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "dispatch_note_article")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub id_dispatch_note: i32,
    pub id_article: i32,
    pub quantity: f64,
    pub created_at: DateTimeWithTimeZone,
    pub d_group: i32,
    pub weight_type: i32,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::article::Entity",
        from = "Column::IdArticle",
        to = "super::article::Column::Id",
        on_update = "NoAction",
        on_delete = "NoAction"
    )]
    Article,
    #[sea_orm(
        belongs_to = "super::data_group::Entity",
        from = "Column::DGroup",
        to = "super::data_group::Column::Id",
        on_update = "NoAction",
        on_delete = "NoAction"
    )]
    DataGroup,
    #[sea_orm(
        belongs_to = "super::dispatch_note::Entity",
        from = "Column::IdDispatchNote",
        to = "super::dispatch_note::Column::Id",
        on_update = "NoAction",
        on_delete = "Cascade"
    )]
    DispatchNote,
    #[sea_orm(
        belongs_to = "super::weight_type::Entity",
        from = "Column::WeightType",
        to = "super::weight_type::Column::Id",
        on_update = "NoAction",
        on_delete = "NoAction"
    )]
    WeightType,
}

impl Related<super::article::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Article.def()
    }
}

impl Related<super::data_group::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::DataGroup.def()
    }
}

impl Related<super::dispatch_note::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::DispatchNote.def()
    }
}

impl Related<super::weight_type::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::WeightType.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}

#[derive(Debug, Enum, Clone, Copy, PartialEq, Eq, DeriveColumn)]
pub enum DispatchNoteArticleFields {
    ArticleName,
    ArticleDescription,
    WeightType,
    Quantity,
}

#[allow(clippy::derivable_impls)]
impl Default for Column {
    fn default() -> Self {
        Column::Id
    }
}

impl GetEntityDataGroupColumnTrait<Column> for Entity {
    fn get_data_group_column() -> Column {
        Column::DGroup
    }
}

#[derive(InputObject)]
pub struct DispatchNoteArticleIds {
    pub id_dispatch_note: Option<i32>,
    pub id_article: Option<i32>,
}

#[derive(InputObject)]
pub struct DispatchNoteArticleInsertOptions {
    pub id_dispatch_note: i32,
    pub id_article: i32,
    pub weight_type: i32,
    pub quantity: f64,
    pub d_group: i32,
}

#[derive(InputObject)]
pub struct DispatchNoteArticleUpdateOptions {
    pub id: i32,
    pub id_dispatch_note: Option<i32>,
    pub id_article: Option<i32>,
    pub weight_type: Option<i32>,
    pub quantity: Option<f64>,
}

#[derive(InputObject)]
pub struct DispatchNoteArticleDeleteOptions {
    pub id_dispatch_note: i32,
    pub id_article: i32,
}

#[derive(Debug, Clone, FromQueryResult)]
pub struct DispatchNoteArticleFlattened {
    pub id: i32,

    pub id_dispatch_note: i32,
    pub quantity: f64,
    pub created_at: DateTimeWithTimeZone,
    pub d_group: i32,

    pub id_article: i32,
    pub name_article: String,
    pub description_article: Option<String>,
    pub d_group_article: i32,
    pub created_at_article: DateTimeWithTimeZone,

    pub note_type_dispatch_note: Option<i32>,
    pub numerical_identifier_dispatch_note: Option<i32>,
    pub issuing_date_dispatch_note: Option<Date>,
    pub created_at_dispatch_note: DateTimeWithTimeZone,
    pub d_group_dispatch_note: i32,

    pub id_d_group: i32,
    pub name_d_group: String,
    pub description_d_group: Option<String>,
    pub created_at_d_group: DateTimeWithTimeZone,
    pub id_mbe_group: i32,

    pub id_weight_type: i32,
    pub unit_short: String,
    pub unit: String,
    pub created_at_weight_type: DateTimeWithTimeZone,
}

#[derive(Debug, SimpleObject)]
pub struct DispatchNoteArticle {
    pub id: i32,
    pub dispatch_note: super::dispatch_note::Model,
    pub article: super::article::Model,
    pub weight_type: super::weight_type::Model,
    pub quantity: f64,
    pub created_at: DateTimeWithTimeZone,
    pub d_group: super::data_group::Model,
}

impl From<QueryResultsHelperType<DispatchNoteArticleFlattened>>
    for QueryResults<DispatchNoteArticle>
{
    fn from(inp: QueryResultsHelperType<DispatchNoteArticleFlattened>) -> Self {
        let (results, items_and_page_number, page, page_size) = inp;
        Self {
            results: results
                .into_iter()
                .map(|flat| DispatchNoteArticle {
                    id: flat.id,
                    quantity: flat.quantity,
                    created_at: flat.created_at,
                    dispatch_note: super::dispatch_note::Model {
                        id: flat.id_dispatch_note,
                        note_type: flat.note_type_dispatch_note,
                        numerical_identifier: flat.numerical_identifier_dispatch_note,
                        issuing_date: flat.issuing_date_dispatch_note,
                        created_at: flat.created_at_dispatch_note,
                        d_group: flat.d_group_dispatch_note,
                    },
                    article: super::article::Model {
                        id: flat.id_article,
                        name: flat.name_article,
                        description: flat.description_article,
                        created_at: flat.created_at_article,
                        d_group: flat.d_group_article,
                    },
                    weight_type: super::weight_type::Model {
                        id: flat.id_weight_type,
                        unit_short: flat.unit_short,
                        unit: flat.unit,
                        created_at: flat.created_at_weight_type,
                    },
                    d_group: super::data_group::Model {
                        id: flat.id_d_group,
                        name: flat.name_d_group,
                        description: flat.description_d_group,
                        created_at: flat.created_at_d_group,
                        id_mbe_group: flat.id_mbe_group,
                    },
                })
                .collect(),
            pagination: Pagination {
                page: page.page,
                page_size: page_size.0,
                total_items: items_and_page_number.number_of_items,
                total_pages: items_and_page_number.number_of_pages,
            },
        }
    }
}

#[async_trait]
impl QueryDatabase for Entity {
    type InnerQueryResultType = DispatchNoteArticle;

    type QueryResultType = QueryResults<Self::InnerQueryResultType>;

    type FetchModel = DispatchNoteArticleFlattened;

    type InsertOptions = DispatchNoteArticleInsertOptions;

    type UpdateOptions = DispatchNoteArticleUpdateOptions;

    type InputFields = DispatchNoteArticleFields;

    type DeleteOptionsType = i32;

    type FetchIdType = Option<DispatchNoteArticleIds>;

    type FilterValueType = String;

    fn get_query() -> Select<Self> {
        Entity::find()
            .inner_join(super::article::Entity)
            .inner_join(super::dispatch_note::Entity)
            .inner_join(super::data_group::Entity)
            .inner_join(super::weight_type::Entity)
            .column_as(super::article::Column::Id, "id_article")
            .column_as(super::article::Column::Name, "name_article")
            .column_as(super::article::Column::Description, "description_article")
            .column_as(super::article::Column::DGroup, "d_group_article")
            .column_as(super::article::Column::CreatedAt, "created_at_article")
            .column_as(super::dispatch_note::Column::Id, "id_dispatch_note")
            .column_as(
                super::dispatch_note::Column::NoteType,
                "note_type_dispatch_note",
            )
            .column_as(
                super::dispatch_note::Column::NumericalIdentifier,
                "numerical_identifier_dispatch_note",
            )
            .column_as(
                super::dispatch_note::Column::IssuingDate,
                "issuing_date_dispatch_note",
            )
            .column_as(
                super::dispatch_note::Column::DGroup,
                "d_group_dispatch_note",
            )
            .column_as(
                super::dispatch_note::Column::CreatedAt,
                "created_at_dispatch_note",
            )
            .column_as(super::data_group::Column::Id, "id_d_group")
            .column_as(super::data_group::Column::Name, "name_d_group")
            .column_as(
                super::data_group::Column::Description,
                "description_d_group",
            )
            .column_as(super::data_group::Column::CreatedAt, "created_at_d_group")
            .column_as(super::data_group::Column::IdMbeGroup, "id_mbe_group")
            .column_as(super::weight_type::Column::Id, "id_weight_type")
            .column_as(super::weight_type::Column::UnitShort, "unit_short")
            .column_as(super::weight_type::Column::Unit, "unit")
            .column_as(
                super::weight_type::Column::CreatedAt,
                "created_at_weight_type",
            )
    }

    async fn delete_query(
        transaction: &DatabaseTransaction,
        options: DeleteOptions<Self::DeleteOptionsType>,
    ) -> Result<DeleteResult> {
        Ok(Self::delete_by_id(options.id).exec(transaction).await?)
    }

    fn add_ordering(
        mut query: Select<Self>,
        ordering_options: Option<OrderingOptions<Self::InputFields>>,
    ) -> Select<Self> {
        match ordering_options {
            Some(options) => {
                let order = options.order.into();
                query = match options.order_by {
                    Self::InputFields::ArticleName => {
                        query.order_by(super::article::Column::Name, order)
                    }
                    Self::InputFields::ArticleDescription => {
                        query.order_by(super::article::Column::Description, order)
                    }
                    Self::InputFields::WeightType => query.order_by(Column::WeightType, order),
                    Self::InputFields::Quantity => query.order_by(Column::Quantity, order),
                };
            }
            None => {
                query = query.order_by(super::article::Column::Id, Order::Asc);
            }
        }
        query
    }

    fn add_id_and_data_group_filters(
        mut query: Select<Self>,
        fetch_options: &FetchOptions<Self::InputFields, Self::FetchIdType>,
    ) -> Select<Self> {
        // common_add_id_and_data_group_filters(query, fetch_options)
        if let Some(ids) = &fetch_options.id {
            if let Some(id_dispatch_note) = ids.id_dispatch_note {
                query = query.filter(Column::IdDispatchNote.eq(id_dispatch_note))
            }
            if let Some(id_article) = ids.id_article {
                query = query.filter(Column::IdArticle.eq(id_article))
            }
            // .filter(Column::DGroup.eq(ids.d_group))
        }
        query = query.filter(Column::DGroup.eq(fetch_options.d_group));
        query
    }

    fn add_filter(query: Select<Self>, filter: Filter<Self::InputFields>) -> Select<Self> {
        match filter.field {
            Self::InputFields::ArticleName => query.filter(
                Expr::expr(Func::lower(Expr::col((
                    super::article::Entity,
                    super::article::Column::Name,
                ))))
                .like(format!("%{}%", filter.value.trim().to_lowercase())),
            ),
            Self::InputFields::ArticleDescription => query.filter(
                Expr::expr(Func::lower(Expr::col((
                    super::article::Entity,
                    super::article::Column::Description,
                ))))
                .like(format!("%{}%", filter.value.trim().to_lowercase())),
            ),
            Self::InputFields::WeightType => query.filter(
                Expr::expr(Func::lower(Expr::col((Entity, Column::WeightType))))
                    .like(format!("%{}%", filter.value.trim().to_lowercase())),
            ),
            _ => query,
        }
    }

    async fn update_entity(
        db: &DatabaseConnection,
        options: Self::UpdateOptions,
    ) -> Result<Self::InnerQueryResultType> {
        let transaction = db.begin().await?;

        let model = ActiveModel {
            id: ActiveValue::Set(options.id),
            id_dispatch_note: options
                .id_dispatch_note
                .map_or(ActiveValue::NotSet, ActiveValue::Set),
            id_article: options
                .id_article
                .map_or(ActiveValue::NotSet, ActiveValue::Set),
            weight_type: options
                .weight_type
                .map_or(ActiveValue::NotSet, ActiveValue::Set),
            quantity: options
                .quantity
                .map_or(ActiveValue::NotSet, ActiveValue::Set),
            ..Default::default()
        };
        let res = Entity::update(model).exec(&transaction).await?;

        transaction.commit().await?;

        Ok(Self::fetch(
            db,
            FetchOptions::<DispatchNoteArticleFields, Option<DispatchNoteArticleIds>> {
                id: Some(DispatchNoteArticleIds {
                    id_dispatch_note: Some(res.id_dispatch_note),
                    id_article: Some(res.id_article),
                }),
                page_size: None,
                page: None,
                ordering: None,
                filters: None,
                d_group: res.d_group,
            },
        )
        .await?
        .results
        .into_iter()
        .enumerate()
        .find(|(i, _)| *i == 0)
        .ok_or_else(|| anyhow!("Updated DispatchNoteArticle not found"))?
        .1)
    }

    async fn insert_entity(
        db: &DatabaseConnection,
        options: Self::InsertOptions,
    ) -> Result<Self::InnerQueryResultType> {
        let model = ActiveModel {
            id_dispatch_note: ActiveValue::Set(options.id_dispatch_note),
            id_article: ActiveValue::Set(options.id_article),
            weight_type: ActiveValue::Set(options.weight_type),
            quantity: ActiveValue::Set(options.quantity),
            d_group: ActiveValue::Set(options.d_group),
            ..Default::default()
        };
        let transaction = db.begin().await?;
        let res = Entity::insert(model)
            .exec_with_returning(&transaction)
            .await?;
        transaction.commit().await?;
        Ok(Self::fetch(
            db,
            FetchOptions::<DispatchNoteArticleFields, Option<DispatchNoteArticleIds>> {
                id: Some(DispatchNoteArticleIds {
                    id_dispatch_note: Some(res.id_dispatch_note),
                    id_article: Some(res.id_article),
                    // d_group: res.d_group,
                }),
                page_size: None,
                page: None,
                ordering: None,
                filters: None,
                d_group: res.d_group,
            },
        )
        .await?
        .results
        .into_iter()
        .enumerate()
        .find(|(i, _)| *i == 0)
        .ok_or_else(|| anyhow!("Inserted DispatchNoteArticle not found"))?
        .1)
    }
}

#[derive(Default)]
pub struct DispatchNoteArticleQuery;

#[Object]
impl DispatchNoteArticleQuery {
    #[graphql(guard = "DataGroupAccessGuard::new(options.d_group)")]
    async fn dispatch_note_articles(
        &self,
        ctx: &Context<'_>,
        options: FetchOptions<DispatchNoteArticleFields, Option<DispatchNoteArticleIds>>,
    ) -> Result<QueryResults<DispatchNoteArticle>> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");
        Entity::fetch(db, options).await
    }
}

#[derive(Default)]
pub struct DispatchNoteArticleMutation;

#[Object]
impl DispatchNoteArticleMutation {
    #[graphql(guard = "DataGroupAccessGuard::new(options.d_group)")]
    async fn insert_dispatch_note_article(
        &self,
        ctx: &Context<'_>,
        options: DispatchNoteArticleInsertOptions,
    ) -> Result<DispatchNoteArticle> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");
        Entity::insert_entity(db, options).await
    }

    #[graphql(guard = "UpdateDeleteGuard::<Entity>::new(options.id)")]
    async fn update_dispatch_note_article(
        &self,
        ctx: &Context<'_>,
        options: DispatchNoteArticleUpdateOptions,
    ) -> Result<DispatchNoteArticle> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");
        Entity::update_entity(db, options).await
    }

    #[graphql(guard = "UpdateDeleteGuard::<Entity>::new(options.id)")]
    async fn delete_dispatch_note_article(
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
