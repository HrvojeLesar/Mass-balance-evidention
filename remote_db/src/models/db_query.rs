use anyhow::Result;
use async_graphql::InputType;
use async_trait::async_trait;
use sqlx::{Database, QueryBuilder, Transaction};

use super::{FetchOptions, FieldsToSql, Filter, OrderingOptions};

pub const MAX_LIMIT: i64 = 100;
pub const DEFAULT_LIMIT: i64 = 10;

#[async_trait]
pub(crate) trait DatabaseQueries<DB>
where
    DB: Database,
    Self: Sized,
{
    type IO;

    type FO;

    type UO;

    type GetManyResult;

    async fn insert(executor: &mut Transaction<'_, DB>, options: &Self::IO) -> Result<Self>;

    async fn get_many(
        executor: &mut Transaction<'_, DB>,
        options: &Self::FO,
    ) -> Result<Self::GetManyResult>;

    async fn get(executor: &mut Transaction<'_, DB>, options: &Self::FO) -> Result<Self>;

    async fn update(executor: &mut Transaction<'_, DB>, options: &Self::UO) -> Result<Self>;
}

pub(crate) trait QueryBuilderHelpers<'q, DB>
where
    DB: Database,
    String: sqlx::Encode<'q, DB>,
    String: sqlx::Type<DB>,
    i64: sqlx::Encode<'q, DB>,
    i64: sqlx::Type<DB>,
{

    fn filter<T: InputType + FieldsToSql>(
        filters: &'q Option<Vec<Filter<T>>>,
        builder: &mut QueryBuilder<'q, DB>,
    ) {
        if let Some(filters) = filters {
            builder.push("WHERE ");
            let mut sep = builder.separated(" AND ");
            for filter in filters {
                sep.push(&filter.field.to_sql())
                    .push_bind_unseparated(&filter.value);
            }
        }
    }

    fn order_by<T: InputType + ToString + Copy>(
        ordering: &Option<OrderingOptions<T>>,
        order_by_default_column: &str,
        builder: &mut QueryBuilder<'q, DB>,
    ) {
        match &ordering {
            Some(ord) => {
                builder.push("ORDER BY ").push(format!(
                    "{} {} ",
                    ord.order_by.to_string(),
                    ord.order.to_string(),
                ));
            }
            None => {
                builder.push(format!("ORDER BY {} ASC ", order_by_default_column));
            }
        };
    }

    fn paginate(
        limit: Option<i64>,
        page: Option<i64>,
        builder: &mut QueryBuilder<'q, DB>,
    ) {
        builder
            .push("LIMIT ")
            .push_bind(Self::calc_limit(limit))
            .push("OFFSET ")
            .push_bind(Self::calc_offset(page, limit));
    }

    fn handle_fetch_options<T: Copy, I>(
        options: &'q FetchOptions<T, I>,
        order_by_default_column: &str,
        builder: &mut QueryBuilder<'q, DB>,
    ) where
        T: InputType + FieldsToSql + ToString,
        I: InputType,
        Filter<T>: InputType,
        OrderingOptions<T>: InputType,
    {
        Self::filter(&options.filters, builder);
        Self::order_by(&options.ordering, order_by_default_column, builder);
        Self::paginate(options.limit, options.page, builder);
    }

    fn calc_limit(limit: Option<i64>) -> i64 {
        match limit {
            Some(l) => {
                if l <= MAX_LIMIT {
                    l
                } else {
                    DEFAULT_LIMIT
                }
            }
            None => DEFAULT_LIMIT,
        }
    }

    fn calc_offset(page: Option<i64>, limit: Option<i64>) -> i64 {
        let page = match page {
            Some(p) => {
                if p < 1 {
                    0
                } else {
                    p - 1
                }
            }
            None => 0,
        };

        page * Self::calc_limit(limit)
    }
}
