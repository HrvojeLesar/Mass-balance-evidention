use async_graphql::{InputType, OutputType, SimpleObject};
use async_trait::async_trait;
use sea_orm::{
    ColumnTrait, ConnectionTrait, DatabaseConnection, DatabaseTransaction, DeleteResult,
    EntityName, EntityTrait, FromQueryResult, ItemsAndPagesNumber, ModelTrait, PaginatorTrait,
    PrimaryKeyTrait, QueryFilter, QueryOrder, Select, Selector, TransactionTrait,
};

use crate::models::{
    buyer::BuyerFields,
    db_query::{calc_limit, QueryBuilderHelpers},
    DeleteOptions, FetchOptions, FetchOptionsNew, FieldTypes, FieldsToSql, Filter, FilterNew,
    OrderingOptions, OrderingOptionsNew, Pagination, PaginationNew,
};

use anyhow::Result;

pub mod prelude;

pub mod buyer;
pub mod cell;
pub mod cell_culture_pair;
pub mod culture;
pub mod data_group;
pub mod entry;
pub mod weight_types;

pub struct Page(pub u64);
pub struct PageSize(pub u64);

pub type QueryResultsHelperType<T> = (Vec<T>, ItemsAndPagesNumber, Page, PageSize);

impl<T> From<QueryResultsHelperType<T>> for QueryResults<T>
where
    T: OutputType,
{
    fn from(inp: QueryResultsHelperType<T>) -> Self {
        let (results, items_and_page_number, page, page_size) = inp;
        Self {
            results: results.into_iter().map(|a| a).collect(),
            pagination: crate::models::PaginationNew {
                page: page.0,
                page_size: page_size.0,
                total_items: items_and_page_number.number_of_items,
                total_pages: items_and_page_number.number_of_pages,
            },
        }
    }
}

#[derive(SimpleObject, Debug)]
pub struct QueryResults<T: OutputType> {
    pub results: Vec<T>,
    #[graphql(flatten)]
    pub pagination: PaginationNew,
}

#[derive(Debug, SimpleObject)]
pub struct TestStruct {
    kekec: i32,
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
    Self: EntityTrait,
    <Self as EntityTrait>::Model: Sync,
{
    type InnerQueryResultType: OutputType;

    type QueryResultType: QueryResultsTrait<Self::InnerQueryResultType>
        // + From<QueryResultsHelperType<Self::InnerQueryResultType>>
        + From<QueryResultsHelperType<Self::FetchModel>>;

    type FetchModel: FromQueryResult + Sync + Send;

    type InsertOptions;

    type UpdateOptions;

    // TODO: better name
    fn get_query() -> Select<Self> {
        <Self as EntityTrait>::find()
    }

    async fn delete_query(
        transaction: &DatabaseTransaction,
        options: DeleteOptions,
    ) -> Result<DeleteResult>;

    fn add_ordering<T>(
        mut query: Select<Self>,
        ordering_options: Option<OrderingOptionsNew<T>>,
    ) -> Select<Self>
    where
        T: InputType,
        <Self as EntityTrait>::Column: From<T>,
    {
        // TODO: Add default ordering
        if let Some(options) = ordering_options {
            query = query.order_by::<<Self as EntityTrait>::Column>(
                options.order_by.into(),
                options.order.into(),
            );
        }
        query
    }

    fn add_filter<T>(mut query: Select<Self>, filter: FilterNew<T>) -> Select<Self>
    where
        T: InputType,
        <Self as EntityTrait>::Column: From<T>,
    {
        let column: <Self as EntityTrait>::Column = filter.field.into();
        match filter.field_type {
            FieldTypes::String => {
                query = query.filter(column.contains(&filter.value));
            }
            FieldTypes::Number => {
                todo!();
            }
            FieldTypes::Date => {
                todo!();
            }
        }
        query
    }

    fn add_filters<T>(mut query: Select<Self>, filters: Option<Vec<FilterNew<T>>>) -> Select<Self>
    where
        T: InputType,
        <Self as EntityTrait>::Column: From<T>,
    {
        if let Some(filters) = filters {
            for filter in filters {
                query = Self::add_filter(query, filter);
            }
        }
        query
    }

    async fn fetch<T>(
        db: &DatabaseConnection,
        fetch_options: FetchOptionsNew<T>,
    ) -> Result<Self::QueryResultType>
    where
        T: InputType,
        <Self as EntityTrait>::Column: From<T>,
        FilterNew<T>: InputType,
        OrderingOptionsNew<T>: InputType,
        Self::QueryResultType: From<QueryResultsHelperType<Self::FetchModel>>,
    {
        let mut query = Self::get_query();
        query = Self::add_ordering(query, fetch_options.ordering);
        query = Self::add_filters(query, fetch_options.filtersnew);

        let transaction = db.begin().await?;

        let paginator = query
            .into_model::<Self::FetchModel>()
            .paginate(&transaction, calc_limit(fetch_options.page_size) as u64);
        let res = paginator
            .fetch_page(fetch_options.page.unwrap_or(0) as u64)
            .await?;

        let num_items_and_pages = paginator.num_items_and_pages().await?;
        transaction.commit().await?;
        Ok((res, num_items_and_pages, Page(0), PageSize(1)).into())
    }

    async fn update_entity(
        db: &DatabaseConnection,
        update_options: Self::UpdateOptions,
    ) -> Result<Self::InnerQueryResultType>;

    async fn delete_entity<T>(
        db: &DatabaseConnection,
        delete_options: DeleteOptions,
    ) -> Result<Self::QueryResultType>
    where
        T: InputType,
        <Self as EntityTrait>::Column: From<T>,
        FilterNew<T>: InputType,
        OrderingOptionsNew<T>: InputType,
        Self::QueryResultType: From<Vec<Self::FetchModel>>,
        <Self as QueryDatabase>::QueryResultType: From<(
            Vec<<Self as QueryDatabase>::FetchModel>,
            ItemsAndPagesNumber,
        )>,
        <Self as QueryDatabase>::QueryResultType: Send,
    {
        // WARN: doesn't work for cell_culture_pair ??
        let fe = FetchOptionsNew::<T> {
            id: Some(delete_options.id),
            page_size: None,
            page: None,
            ordering: None,
            filtersnew: None,
            data_group_id: None,
        };

        let fetched_entity = Self::fetch(db, fe).await?;
        let results = fetched_entity.get_results();

        let transaction = db.begin().await?;

        let is_deleted = if !results.is_empty() {
            Self::delete_query(&transaction, delete_options)
                .await?
                .rows_affected
                > 0
        } else {
            false
        };

        transaction.commit().await?;

        if is_deleted {
            return Ok(fetched_entity);
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

// impl<T> ToQueryResults for Vec<T> {
//     fn convert<O>(
//         self,
//         num_items_and_pages: ItemsAndPagesNumber,
//         page: u64,
//         page_size: u64,
//     ) -> QueryResults<O>
//     where
//         O: OutputType + From<T>,
//     {
//         QueryResults {
//             results: self.into_iter().map(|a| a.into()).collect::<Vec<O>>(),
//             pagination: PaginationNew {
//                 page,
//                 page_size,
//                 total_items: num_items_and_pages.number_of_items,
//                 total_pages: num_items_and_pages.number_of_pages,
//             },
//         }
//     }
// }

// pub trait ToQueryResults {
//     fn convert<O>(
//         self,
//         num_items_and_pages: ItemsAndPagesNumber,
//         page: u64,
//         page_size: u64,
//     ) -> QueryResults<O>
//     where
//         Self: Sized,
//         O: OutputType + From<Self>;
// }
