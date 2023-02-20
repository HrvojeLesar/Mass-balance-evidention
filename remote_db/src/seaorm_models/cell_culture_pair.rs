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
    graphql_schema::{DeleteOptions, FetchOptions, Filter, OrderingOptions, Pagination},
    GetDataGroupColumnTrait, QueryDatabase, QueryResults, QueryResultsHelperType, RowsDeleted,
};

use anyhow::{anyhow, Result};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "cell_culture_pair")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub id_cell: i32,
    pub id_culture: i32,
    pub created_at: DateTimeWithTimeZone,
    pub d_group: i32,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::cell::Entity",
        from = "Column::IdCell",
        to = "super::cell::Column::Id",
        on_update = "NoAction",
        on_delete = "NoAction"
    )]
    Cell,
    #[sea_orm(
        belongs_to = "super::culture::Entity",
        from = "Column::IdCulture",
        to = "super::culture::Column::Id",
        on_update = "NoAction",
        on_delete = "NoAction"
    )]
    Culture,
    #[sea_orm(
        belongs_to = "super::data_group::Entity",
        from = "Column::DGroup",
        to = "super::data_group::Column::Id",
        on_update = "NoAction",
        on_delete = "NoAction"
    )]
    DataGroup,
    #[sea_orm(has_many = "super::entry::Entity")]
    Entry,
}

impl Related<super::cell::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Cell.def()
    }
}

impl Related<super::culture::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Culture.def()
    }
}

impl Related<super::data_group::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::DataGroup.def()
    }
}

impl Related<super::entry::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Entry.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}

#[derive(Debug, Enum, Clone, Copy, PartialEq, Eq, DeriveColumn)]
pub enum CellCulturePairFields {
    CellName,
    CellDescription,
    CultureName,
    CultureDescription,
}

impl Default for Column {
    fn default() -> Self {
        Column::IdCell
    }
}

impl GetDataGroupColumnTrait<Column> for Entity {
    fn get_data_group_column() -> Column {
        Column::DGroup
    }
    fn get_id_column() -> Column {
        Column::IdCell
    }
}

#[derive(InputObject)]
pub struct CellCulturePairIds {
    pub id_cell: i32,
    pub id_culture: i32,
    pub d_group: i32,
}

#[derive(InputObject)]
pub struct CellCulturePairUpdateOptions {
    pub id: i32,
    pub id_cell: Option<i32>,
    pub id_culture: Option<i32>,
}

#[derive(Debug, Clone, FromQueryResult)]
pub struct CellCulturePairFlattened {
    pub id: i32,
    pub created_at: DateTimeWithTimeZone,
    pub d_group: i32,

    pub id_cell: i32,
    pub name_cell: String,
    pub description_cell: Option<String>,
    pub created_at_cell: DateTimeWithTimeZone,
    pub d_group_cell: i32,

    pub id_culture: i32,
    pub name_culture: String,
    pub description_culture: Option<String>,
    pub created_at_culture: DateTimeWithTimeZone,
    pub d_group_culture: i32,

    pub id_d_group: i32,
    pub name_d_group: String,
    pub description_d_group: Option<String>,
    pub created_at_d_group: DateTimeWithTimeZone,
}

#[derive(Debug, SimpleObject)]
pub struct CellCulturePair {
    pub id: i32,
    pub cell: super::cell::Model,
    pub culture: super::culture::Model,
    pub created_at: DateTimeWithTimeZone,
    pub d_group: super::data_group::Model,
}

#[derive(Debug, SimpleObject)]
pub struct AllCellCulturePairs {
    results: Vec<CellCulturePair>,
    total: u64,
}

impl From<QueryResultsHelperType<CellCulturePairFlattened>> for QueryResults<CellCulturePair> {
    fn from(inp: QueryResultsHelperType<CellCulturePairFlattened>) -> Self {
        let (results, items_and_page_number, page, page_size) = inp;
        Self {
            results: results
                .into_iter()
                .map(|flat| CellCulturePair {
                    id: flat.id,
                    created_at: flat.created_at,
                    cell: super::cell::Model {
                        id: flat.id_cell,
                        name: flat.name_cell,
                        description: flat.description_cell,
                        created_at: flat.created_at_cell,
                        d_group: flat.d_group_cell,
                    },
                    culture: super::culture::Model {
                        id: flat.id_culture,
                        name: flat.name_culture,
                        description: flat.description_culture,
                        created_at: flat.created_at_culture,
                        d_group: flat.d_group_culture,
                    },
                    d_group: super::data_group::Model {
                        id: flat.id_d_group,
                        name: flat.name_d_group,
                        description: flat.description_d_group,
                        created_at: flat.created_at_d_group,
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
    type InnerQueryResultType = CellCulturePair;

    type QueryResultType = QueryResults<Self::InnerQueryResultType>;

    type FetchModel = CellCulturePairFlattened;

    type InsertOptions = CellCulturePairIds;

    type UpdateOptions = CellCulturePairUpdateOptions;

    type InputFields = CellCulturePairFields;

    type DeleteOptionsType = i32;

    type FetchIdType = Option<CellCulturePairIds>;

    type FilterValueType = String;

    fn get_query() -> Select<Self> {
        Entity::find()
            .inner_join(super::cell::Entity)
            .inner_join(super::culture::Entity)
            .inner_join(super::data_group::Entity)
            .column_as(super::cell::Column::Id, "id_cell")
            .column_as(super::cell::Column::Name, "name_cell")
            .column_as(super::cell::Column::Description, "description_cell")
            .column_as(super::cell::Column::CreatedAt, "created_at_cell")
            .column_as(super::cell::Column::DGroup, "d_group_cell")
            .column_as(super::culture::Column::Id, "id_culture")
            .column_as(super::culture::Column::Name, "name_culture")
            .column_as(super::culture::Column::Description, "description_culture")
            .column_as(super::culture::Column::CreatedAt, "created_at_culture")
            .column_as(super::culture::Column::DGroup, "d_group_culture")
            .column_as(super::data_group::Column::Id, "id_d_group")
            .column_as(super::data_group::Column::Name, "name_d_group")
            .column_as(
                super::data_group::Column::Description,
                "description_d_group",
            )
            .column_as(super::data_group::Column::CreatedAt, "created_at_d_group")
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
                    Self::InputFields::CellName => query.order_by(super::cell::Column::Name, order),
                    Self::InputFields::CellDescription => {
                        query.order_by(super::cell::Column::Description, order)
                    }
                    Self::InputFields::CultureName => {
                        query.order_by(super::culture::Column::Name, order)
                    }
                    Self::InputFields::CultureDescription => {
                        query.order_by(super::culture::Column::Description, order)
                    }
                };
            }
            None => {
                query = query.order_by(super::cell::Column::Name, Order::Asc);
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
            query = query
                .filter(Column::IdCell.eq(ids.id_cell))
                .filter(Column::IdCulture.eq(ids.id_culture))
                .filter(Column::DGroup.eq(ids.d_group))
        }
        if let Some(data_group) = fetch_options.data_group_id {
            query = query.filter(Column::DGroup.eq(data_group));
        }
        query
    }

    fn add_filter(query: Select<Self>, filter: Filter<Self::InputFields>) -> Select<Self> {
        match filter.field {
            Self::InputFields::CellName => query.filter(
                Expr::expr(Func::lower(Expr::col((
                    super::cell::Entity,
                    super::cell::Column::Name,
                ))))
                .like(format!("%{}%", filter.value.trim().to_lowercase())),
            ),
            Self::InputFields::CellDescription => query.filter(
                Expr::expr(Func::lower(Expr::col((
                    super::cell::Entity,
                    super::cell::Column::Description,
                ))))
                .like(format!("%{}%", filter.value.trim().to_lowercase())),
            ),
            Self::InputFields::CultureName => query.filter(
                Expr::expr(Func::lower(Expr::col((
                    super::culture::Entity,
                    super::culture::Column::Name,
                ))))
                .like(format!("%{}%", filter.value.trim().to_lowercase())),
            ),
            Self::InputFields::CultureDescription => query.filter(
                Expr::expr(Func::lower(Expr::col((
                    super::culture::Entity,
                    super::culture::Column::Description,
                ))))
                .like(format!("%{}%", filter.value.trim().to_lowercase())),
            ),
        }
    }

    async fn update_entity(
        db: &DatabaseConnection,
        options: Self::UpdateOptions,
    ) -> Result<Self::InnerQueryResultType> {
        let transaction = db.begin().await?;

        let model = ActiveModel {
            id: ActiveValue::Set(options.id),
            id_cell: options
                .id_cell
                .map_or(ActiveValue::NotSet, ActiveValue::Set),
            id_culture: options
                .id_cell
                .map_or(ActiveValue::NotSet, ActiveValue::Set),
            ..Default::default()
        };
        let res = Entity::update(model).exec(&transaction).await?;

        transaction.commit().await?;

        Ok(Self::fetch(
            db,
            FetchOptions::<CellCulturePairFields, Option<CellCulturePairIds>> {
                id: Some(CellCulturePairIds {
                    id_cell: res.id_cell,
                    id_culture: res.id_culture,
                    d_group: res.d_group,
                }),
                page_size: None,
                page: None,
                ordering: None,
                filters: None,
                data_group_id: None,
            },
        )
        .await?
        .results
        .into_iter()
        .enumerate()
        .find(|(i, _)| *i == 0)
        .ok_or_else(|| anyhow!("Updated CellCulturePair not found"))?
        .1)
    }

    async fn insert_entity(
        db: &DatabaseConnection,
        options: Self::InsertOptions,
    ) -> Result<Self::InnerQueryResultType> {
        let model = ActiveModel {
            id_cell: ActiveValue::Set(options.id_cell),
            id_culture: ActiveValue::Set(options.id_culture),
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
            FetchOptions::<CellCulturePairFields, Option<CellCulturePairIds>> {
                id: Some(CellCulturePairIds {
                    id_cell: res.id_cell,
                    id_culture: res.id_culture,
                    d_group: res.d_group,
                }),
                page_size: None,
                page: None,
                ordering: None,
                filters: None,
                data_group_id: Some(res.d_group),
            },
        )
        .await?
        .results
        .into_iter()
        .enumerate()
        .find(|(i, _)| *i == 0)
        .ok_or_else(|| anyhow!("Inserted CellCulturePair not found"))?
        .1)
    }
}

#[derive(Default)]
pub struct CellCulturePairQuery;

#[Object]
impl CellCulturePairQuery {
    async fn cell_culture_pairs(
        &self,
        ctx: &Context<'_>,
        options: FetchOptions<CellCulturePairFields, Option<CellCulturePairIds>>,
    ) -> Result<QueryResults<CellCulturePair>> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");
        Entity::fetch(db, options).await
    }

    async fn all_cell_culture_pairs(
        &self,
        ctx: &Context<'_>,
        options: FetchOptions<CellCulturePairFields, Option<CellCulturePairIds>>,
    ) -> Result<AllCellCulturePairs> {
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

        Ok(AllCellCulturePairs {
            total: res.len() as u64,
            results: res
                .into_iter()
                .map(|flat| CellCulturePair {
                    id: flat.id,
                    created_at: flat.created_at,
                    cell: super::cell::Model {
                        id: flat.id_cell,
                        name: flat.name_cell,
                        description: flat.description_cell,
                        created_at: flat.created_at_cell,
                        d_group: flat.d_group_cell,
                    },
                    culture: super::culture::Model {
                        id: flat.id_culture,
                        name: flat.name_culture,
                        description: flat.description_culture,
                        created_at: flat.created_at_culture,
                        d_group: flat.d_group_culture,
                    },
                    d_group: super::data_group::Model {
                        id: flat.id_d_group,
                        name: flat.name_d_group,
                        description: flat.description_d_group,
                        created_at: flat.created_at_d_group,
                    },
                })
                .collect(),
        })
    }
}

#[derive(Default)]
pub struct CellCulturePairMutation;

#[Object]
impl CellCulturePairMutation {
    async fn insert_cell_culture_pair(
        &self,
        ctx: &Context<'_>,
        options: CellCulturePairIds,
    ) -> Result<CellCulturePair> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");
        Entity::insert_entity(db, options).await
    }

    async fn update_cell_culture_pair(
        &self,
        ctx: &Context<'_>,
        options: CellCulturePairUpdateOptions,
    ) -> Result<CellCulturePair> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");
        Entity::update_entity(db, options).await
    }

    async fn delete_cell_culture_pair(
        &self,
        ctx: &Context<'_>,
        options: DeleteOptions,
    ) -> Result<RowsDeleted> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");
        Entity::delete_entity(db, options).await
    }
}
