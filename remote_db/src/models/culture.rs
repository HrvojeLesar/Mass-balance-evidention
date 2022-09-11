use anyhow::Result;
use async_graphql::{Context, InputObject, SimpleObject, Object};
use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::{Postgres, Transaction, FromRow};

use crate::{models::MAX_LIMIT, DatabasePool};

use super::{db_query::DatabaseQueries, DEFAULT_LIMIT};

#[derive(SimpleObject, FromRow, Debug)]
pub(super) struct Culture {
    pub(super) id: i32,
    pub(super) name: String,
    pub(super) description: Option<String>,
    pub(super) created_at: DateTime<Utc>,
}

#[derive(InputObject)]
pub(super) struct CultureInsertOptions {
    pub(super) name: String,
    pub(super) description: Option<String>,
}

#[derive(InputObject)]
pub(super) struct CultureFetchOptions {
    pub(super) id: Option<i32>,
    pub(super) limit: Option<i64>,
}

#[derive(InputObject)]
pub(super) struct CultureUpdateOptions {
    pub(super) id: i32,
    pub(super) name: Option<String>,
    pub(super) description: Option<String>,
}

#[async_trait]
impl DatabaseQueries<Postgres> for Culture {
    type IO = CultureInsertOptions;

    type FO = CultureFetchOptions;

    type UO = CultureUpdateOptions;

    async fn insert(
        executor: &mut Transaction<'_, Postgres>,
        options: &CultureInsertOptions,
    ) -> Result<Self> {
        Ok(sqlx::query_as!(
            Self,
            "
            INSERT INTO culture (name, description)
            VALUES ($1, $2)
            RETURNING *
            ",
            options.name,
            options.description,
        )
        .fetch_one(executor)
        .await?)
    }

    async fn get_many(
        executor: &mut Transaction<'_, Postgres>,
        options: &CultureFetchOptions,
    ) -> Result<Vec<Self>> {
        let limit = options.limit.unwrap_or(DEFAULT_LIMIT);
        Ok(sqlx::query_as!(
            Self,
            "
            SELECT * FROM culture
            WHERE id >= $1
            ORDER BY id ASC
            LIMIT $2
            ",
            options.id.unwrap_or(0),
            if limit <= MAX_LIMIT {
                limit
            } else {
                DEFAULT_LIMIT
            }
        )
        .fetch_all(executor)
        .await?)
    }

    async fn get(
        executor: &mut Transaction<'_, Postgres>,
        options: &CultureFetchOptions,
    ) -> Result<Self> {
        Ok(sqlx::query_as!(
            Self,
            "
            SELECT * FROM culture
            WHERE id = $1
            ",
            options.id
        )
        .fetch_one(executor)
        .await?)
    }

    async fn update(
        executor: &mut Transaction<'_, Postgres>,
        options: &CultureUpdateOptions,
    ) -> Result<Self> {
        let mut builder: sqlx::QueryBuilder<Postgres> =
            sqlx::QueryBuilder::new("UPDATE culture SET ");
        let mut sep = builder.separated(", ");
        if let Some(name) = &options.name {
            sep.push("name = ").push_bind_unseparated(name);
        }
        if let Some(description) = &options.description {
            sep.push("description = ")
                .push_bind_unseparated(description);
        }
        builder
            .push("WHERE id = ")
            .push_bind(options.id)
            .push("RETURNING *");

        let query = builder.build_query_as();
        Ok(query.fetch_one(executor).await?)
    }
}

#[derive(Default)]
pub struct CultureQuery;

#[Object]
impl CultureQuery {
    async fn cultures(
        &self,
        ctx: &Context<'_>,
        fetch_options: CultureFetchOptions,
    ) -> Result<Vec<Culture>> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let cells = Culture::get_many(&mut transaction, &fetch_options).await?;

        transaction.commit().await?;
        Ok(cells)
    }

    async fn culture(&self, ctx: &Context<'_>, fetch_options: CultureFetchOptions) -> Result<Culture> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let cells = Culture::get(&mut transaction, &fetch_options).await?;

        transaction.commit().await?;
        Ok(cells)
    }
}

#[derive(Default)]
pub struct CultureMutation;

#[Object]
impl CultureMutation {
    async fn insert_culture(
        &self,
        ctx: &Context<'_>,
        insert_options: CultureInsertOptions,
    ) -> Result<Culture> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let cell = Culture::insert(&mut transaction, &insert_options).await?;

        transaction.commit().await?;
        Ok(cell)
    }

    async fn update_culture(
        &self,
        ctx: &Context<'_>,
        update_options: CultureUpdateOptions,
    ) -> Result<Culture> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let cell = Culture::update(&mut transaction, &update_options).await?;

        transaction.commit().await?;
        Ok(cell)
    }
}
