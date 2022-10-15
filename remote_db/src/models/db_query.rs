use anyhow::Result;
use async_graphql::InputType;
use async_trait::async_trait;
use sqlx::{Database, QueryBuilder, Transaction};

use super::{FetchOptions, FieldsToSql, Filter, OrderingOptions};

pub const MAX_LIMIT: i64 = 100;
pub const DEFAULT_LIMIT: i64 = 10;

/// 0 == exact match, x > 0 partial match
/// bigger values entails less strict matching
pub const MAX_SCORE: &str = "0.7";

#[async_trait]
pub(crate) trait DatabaseQueries<DB>
where
    DB: Database,
    Self: Sized,
{
    type IO;

    type FO;

    type UO;

    type DO;

    type GetManyResult;

    async fn insert(executor: &mut Transaction<'_, DB>, options: &Self::IO) -> Result<Self>;

    async fn get_many(
        executor: &mut Transaction<'_, DB>,
        options: &Self::FO,
    ) -> Result<Self::GetManyResult>;

    async fn get(executor: &mut Transaction<'_, DB>, options: &Self::FO) -> Result<Self>;

    async fn update(executor: &mut Transaction<'_, DB>, options: &Self::UO) -> Result<Self>;

    async fn delete(executor: &mut Transaction<'_, DB>, options: &Self::DO) -> Result<Self>;
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
        push_where: bool,
    ) {
        if let Some(filters) = filters {
            if push_where && filters.len() > 0 {
                builder.push("WHERE ");
            }
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
                builder.push(" ORDER BY ").push(format!(
                    "{} {} ",
                    ord.order_by.to_string(),
                    ord.order.to_string(),
                ));
            }
            None => {
                builder.push(format!(" ORDER BY {} ASC ", order_by_default_column));
            }
        };
    }

    fn paginate(limit: Option<i64>, page: Option<i64>, builder: &mut QueryBuilder<'q, DB>) {
        builder
            .push("LIMIT ")
            .push_bind(Self::calc_limit(limit))
            .push("OFFSET ")
            .push_bind(Self::calc_offset(page, limit));
    }

    fn filter_and_order_with_score<T: InputType + FieldsToSql + Copy>(
        table_name: &str,
        filters: &'q Option<Vec<Filter<T>>>,
        ordering: &Option<OrderingOptions<T>>,
        order_by_default_column: &str,
        builder: &mut QueryBuilder<'q, DB>,
    ) {
        if filters.is_none() {
            builder.push(&table_name);
            Self::order_by(&ordering, &order_by_default_column, builder);
            return;
        }

        let order = match ordering {
            Some(ord) => ord.order.to_string(),
            None => "ASC".to_string(),
        };

        if let Some(filters) = filters {
            if filters.len() == 0 {
                builder.push(&table_name);
                Self::order_by(&ordering, &order_by_default_column, builder);
                return;
            }
            builder.push("(SELECT *, ");
            let mut separator = builder.separated(", ");
            for (idx, filter) in filters.iter().enumerate() {
                separator
                    .push(format!("{} <-> ", filter.field.to_string()))
                    .push_bind_unseparated(&filter.value)
                    .push_unseparated(format!(" as score_{} ", idx));
            }
            builder.push(format!(" FROM {0}) as {0}s WHERE ", table_name));
            let mut separator = builder.separated(" AND ");
            for (idx, _) in filters.iter().enumerate() {
                separator.push(format!("{}s.score_{} < {}", table_name, idx, MAX_SCORE));
            }
            builder.push("ORDER BY ");
            let mut separator = builder.separated(", ");
            for (idx, _) in filters.iter().enumerate() {
                separator.push(format!("{}s.score_{} {}", table_name, idx, order));
            }
        }

        match ordering {
            Some(ordering) => {
                builder.push(format!(", {} {} ", ordering.order_by.to_string(), order));
            }
            None => {
                builder.push(format!(", {} ASC ", order_by_default_column));
            }
        }
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
        Self::filter(&options.filters, builder, true);
        Self::order_by(&options.ordering, order_by_default_column, builder);
        Self::paginate(options.limit, options.page, builder);
    }

    fn handle_fetch_options_with_score<T: Copy, I>(
        options: &'q FetchOptions<T, I>,
        table_name: &str,
        order_by_default_column: &str,
        builder: &mut QueryBuilder<'q, DB>,
    ) where
        T: InputType + FieldsToSql + ToString,
        I: InputType,
        Filter<T>: InputType,
        OrderingOptions<T>: InputType,
    {
        Self::filter_and_order_with_score(
            &table_name,
            &options.filters,
            &options.ordering,
            order_by_default_column,
            builder,
        );
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
