use async_graphql::{InputType, OutputType, SimpleObject};
use async_trait::async_trait;
use log::error;
use sea_orm::{
    sea_query::{Expr, Func},
    ColumnTrait, DatabaseConnection, DatabaseTransaction, DeleteResult, EntityTrait,
    FromQueryResult, ItemsAndPagesNumber, Order, Paginator, PaginatorTrait, QueryFilter,
    QueryOrder, Select, SelectModel, TransactionTrait,
};

use anyhow::Result;

use self::graphql_schema::{
    DeleteOptions, FetchOptions, FieldTypes, Filter, OrderingOptions, Pagination,
};

pub mod prelude;

pub mod buyer;
pub mod cell;
pub mod cell_culture_pair;
pub mod culture;
pub mod data_group;
pub mod entry;
pub mod graphql_schema;
pub mod weight_types;

const MAX_PAGE_SIZE: u64 = 100;
const DEFAULT_PAGE_SIZE: u64 = 10;

#[derive(Clone, Copy, Debug)]
pub struct Page(pub u64);
#[derive(Clone, Copy, Debug)]
pub struct PageSize(pub u64);

#[derive(Clone, Copy, Debug, SimpleObject)]
pub struct RowsDeleted {
    pub num_rows: u64,
}

impl From<DeleteResult> for RowsDeleted {
    fn from(dr: DeleteResult) -> Self {
        RowsDeleted {
            num_rows: dr.rows_affected,
        }
    }
}

pub type QueryResultsHelperType<T> = (Vec<T>, ItemsAndPagesNumber, Page, PageSize);

impl<T> From<QueryResultsHelperType<T>> for QueryResults<T>
where
    T: OutputType,
{
    fn from(inp: QueryResultsHelperType<T>) -> Self {
        let (results, items_and_page_number, page, page_size) = inp;
        Self {
            results,
            pagination: Pagination {
                page: page.0,
                page_size: page_size.0,
                total_items: items_and_page_number.number_of_items,
                total_pages: items_and_page_number.number_of_pages,
            },
        }
    }
}

#[derive(SimpleObject, Debug)]
#[graphql(concrete(name = "BuyerResult", params(buyer::Model)))]
#[graphql(concrete(name = "CellResult", params(cell::Model)))]
#[graphql(concrete(name = "CultureResult", params(culture::Model)))]
#[graphql(concrete(name = "DataGroupResult", params(data_group::Model)))]
#[graphql(concrete(
    name = "CellCulturePairResult",
    params(cell_culture_pair::CellCulturePair)
))]
#[graphql(concrete(name = "EntryResult", params(entry::Entry)))]
pub struct QueryResults<T: OutputType> {
    pub results: Vec<T>,
    #[graphql(flatten)]
    pub pagination: Pagination,
}

impl<T> QueryResultsTrait<T> for QueryResults<T>
where
    T: OutputType,
{
    fn get_results(&self) -> &[T] {
        self.results.as_ref()
    }
}

#[async_trait]
pub trait QueryDatabase
where
    Self: EntityTrait + GetDataGroupColumnTrait<<Self as EntityTrait>::Column>,
    <Self as EntityTrait>::Model: Sync,
    <Self as EntityTrait>::Column: Default,
    Filter<Self::InputFields>: InputType,
    OrderingOptions<Self::InputFields>: InputType,
{
    type InnerQueryResultType: OutputType;

    type QueryResultType: QueryResultsTrait<Self::InnerQueryResultType>
        + From<QueryResultsHelperType<Self::FetchModel>>;

    type FetchModel: FromQueryResult + Sync + Send;

    type InsertOptions;

    type UpdateOptions;

    type InputFields: InputType;

    type DeleteOptionsType: InputType;

    type FetchIdType: InputType;

    // TODO: better name
    fn get_query() -> Select<Self> {
        <Self as EntityTrait>::find()
    }

    async fn delete_query(
        transaction: &DatabaseTransaction,
        options: DeleteOptions<Self::DeleteOptionsType>,
    ) -> Result<DeleteResult>;

    fn add_ordering(
        query: Select<Self>,
        ordering_options: Option<OrderingOptions<Self::InputFields>>,
    ) -> Select<Self>;

    fn add_id_and_data_group_filters(
        query: Select<Self>,
        fetch_options: &FetchOptions<Self::InputFields, Self::FetchIdType>,
    ) -> Select<Self>;

    fn paginate_query(
        query: Select<Self>,
        transaction: &DatabaseTransaction,
        page_size: PageSize,
    ) -> Paginator<DatabaseTransaction, SelectModel<<Self as QueryDatabase>::FetchModel>> {
        query
            .into_model::<Self::FetchModel>()
            .paginate(transaction, page_size.0)
    }

    fn add_filter(query: Select<Self>, filter: Filter<Self::InputFields>) -> Select<Self>;

    fn add_filters(
        mut query: Select<Self>,
        filters: Option<Vec<Filter<Self::InputFields>>>,
    ) -> Select<Self> {
        if let Some(filters) = filters {
            for filter in filters {
                query = Self::add_filter(query, filter);
            }
        }
        query
    }

    async fn fetch(
        db: &DatabaseConnection,
        fetch_options: FetchOptions<Self::InputFields, Self::FetchIdType>,
    ) -> Result<Self::QueryResultType>
    where
        Self::QueryResultType: From<QueryResultsHelperType<Self::FetchModel>>,
    {
        let page_size = PageSize(calculate_page_size(fetch_options.page_size));
        let page = Page(fetch_options.page.unwrap_or(0));

        let mut query = Self::get_query();

        query = Self::add_id_and_data_group_filters(query, &fetch_options);
        query = Self::add_ordering(query, fetch_options.ordering);
        query = Self::add_filters(query, fetch_options.filters);

        let transaction = db.begin().await?;

        let paginator = Self::paginate_query(query, &transaction, page_size);
        let res = paginator.fetch_page(page.0).await?;
        let num_items_and_pages = paginator.num_items_and_pages().await?;

        transaction.commit().await?;
        Ok((res, num_items_and_pages, page, page_size).into())
    }

    async fn update_entity(
        db: &DatabaseConnection,
        update_options: Self::UpdateOptions,
    ) -> Result<Self::InnerQueryResultType>;

    async fn delete_entity(
        db: &DatabaseConnection,
        delete_options: DeleteOptions<Self::DeleteOptionsType>,
    ) -> Result<RowsDeleted> {
        let transaction = db.begin().await?;

        let res = Self::delete_query(&transaction, delete_options).await?;

        transaction.commit().await?;

        if res.rows_affected > 0 {
            return Ok(res.into());
        } else {
            return Err(anyhow::anyhow!("No rows were deleted"));
        }
    }

    async fn insert_entity(
        db: &DatabaseConnection,
        options: Self::InsertOptions,
    ) -> Result<Self::InnerQueryResultType>;
}

pub trait QueryResultsTrait<T> {
    fn get_results(&self) -> &[T];
}

pub trait GetDataGroupColumnTrait<T>
where
    Self: EntityTrait,
    T: ColumnTrait,
{
    fn get_data_group_column() -> T;
    fn get_id_column() -> T;
}

fn calculate_page_size(page_size: Option<u64>) -> u64 {
    let page_size = page_size.unwrap_or(DEFAULT_PAGE_SIZE);
    if page_size < MAX_PAGE_SIZE {
        page_size
    } else {
        DEFAULT_PAGE_SIZE
    }
}

// TODO: Make a usable filter
pub fn common_add_filter<E, T>(mut query: Select<E>, filter: Filter<T>) -> Select<E>
where
    T: InputType,
    E: EntityTrait,
    <E as EntityTrait>::Column: From<T>,
{
    let column: <E as EntityTrait>::Column = filter.field.into();
    match filter.field_type {
        FieldTypes::String => {
            query = query.filter(
                Expr::expr(Func::lower(Expr::col(column))).like(format!("%{}%", filter.value)),
            );
        }
        FieldTypes::Number => {
            match filter.value.parse::<i32>() {
                Ok(val) => {
                    query = query.filter(column.eq(val));
                }
                Err(e) => {
                    error!("Inputed field value for Number is not a number, ignoring filter option: {:#?}", e);
                }
            }
        }
        // Range exact, range based
        FieldTypes::Date => {
            todo!();
        }
    }
    query
}

pub fn common_add_ordering<E, T>(
    mut query: Select<E>,
    ordering_options: Option<OrderingOptions<T>>,
) -> Select<E>
where
    T: InputType,
    E: EntityTrait,
    <E as EntityTrait>::Column: From<T> + Default,
{
    match ordering_options {
        Some(options) => {
            query = query.order_by::<<E as EntityTrait>::Column>(
                options.order_by.into(),
                options.order.into(),
            );
        }
        None => {
            query = query.order_by::<<E as EntityTrait>::Column>(
                <E as EntityTrait>::Column::default(),
                Order::Asc,
            );
        }
    }
    query
}

pub fn common_add_id_and_data_group_filters<E, T>(
    mut query: Select<E>,
    fetch_options: &FetchOptions<T, Option<i32>>,
) -> Select<E>
where
    E: EntityTrait + GetDataGroupColumnTrait<<E as EntityTrait>::Column>,
    T: InputType,
    OrderingOptions<T>: InputType,
    Filter<T>: InputType,
{
    if let Some(id) = fetch_options.id {
        query = query.filter(E::get_id_column().eq(id));
    }
    if let Some(data_group) = fetch_options.data_group_id {
        query = query.filter(E::get_data_group_column().eq(data_group));
    }
    query
}
