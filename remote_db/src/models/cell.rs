use anyhow::Result;
use async_graphql::{Context, InputObject, Object, SimpleObject};
use async_trait::async_trait;
use chrono::{DateTime, Utc};

use sqlx::{FromRow, Postgres, Transaction};

use crate::{
    models::{DEFAULT_LIMIT, MAX_LIMIT},
    DatabasePool,
};

use super::db_query::DatabaseQueries;

#[derive(SimpleObject, FromRow, Debug)]
#[graphql(input_name = "CellInput")]
pub(super) struct Cell {
    pub(super) id: i32,
    pub(super) name: String,
    pub(super) description: Option<String>,
    pub(super) created_at: DateTime<Utc>,
}

#[derive(InputObject)]
pub(super) struct CellInsertOptions {
    pub(super) name: String,
    pub(super) description: Option<String>,
}

#[derive(InputObject)]
pub(super) struct CellFetchOptions {
    pub(super) id: Option<i32>,
    pub(super) limit: Option<i64>,
}

#[derive(InputObject)]
pub(super) struct CellUpdateOptions {
    pub(super) id: i32,
    pub(super) name: Option<String>,
    pub(super) description: Option<String>,
}

#[async_trait]
impl DatabaseQueries<Postgres> for Cell {
    type IO = CellInsertOptions;

    type FO = CellFetchOptions;

    type UO = CellUpdateOptions;

    async fn insert(
        executor: &mut Transaction<'_, Postgres>,
        options: &CellInsertOptions,
    ) -> Result<Self> {
        Ok(sqlx::query_as!(
            Self,
            "
            INSERT INTO cell (name, description)
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
        options: &CellFetchOptions,
    ) -> Result<Vec<Self>> {
        let limit = options.limit.unwrap_or(DEFAULT_LIMIT);
        Ok(sqlx::query_as!(
            Self,
            "
            SELECT * FROM cell
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

    async fn get(executor: &mut Transaction<'_, Postgres>, options: &CellFetchOptions) -> Result<Self> {
        Ok(sqlx::query_as!(
            Self,
            "
            SELECT * FROM cell
            WHERE id = $1
            ",
            options.id
        )
        .fetch_one(executor)
        .await?)
    }

    async fn update(
        executor: &mut Transaction<'_, Postgres>,
        options: &CellUpdateOptions,
    ) -> Result<Self> {
        let mut builder: sqlx::QueryBuilder<Postgres> = sqlx::QueryBuilder::new("UPDATE cell SET ");
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
pub struct CellQuery;

#[Object]
impl CellQuery {
    async fn cells(
        &self,
        ctx: &Context<'_>,
        fetch_options: CellFetchOptions,
    ) -> Result<Vec<Cell>> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let cells = Cell::get_many(&mut transaction, &fetch_options).await?;

        transaction.commit().await?;
        Ok(cells)
    }

    async fn cell(
        &self,
        ctx: &Context<'_>,
        fetch_options: CellFetchOptions,
    ) -> Result<Cell> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let cells = Cell::get(&mut transaction, &fetch_options).await?;

        transaction.commit().await?;
        Ok(cells)
    }
}

#[derive(Default)]
pub struct CellMutation;

#[Object]
impl CellMutation {
    async fn insert_cell(
        &self,
        ctx: &Context<'_>,
        insert_options: CellInsertOptions,
    ) -> Result<Cell> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let cell = Cell::insert(&mut transaction, &insert_options).await?;

        transaction.commit().await?;
        Ok(cell)
    }

    async fn update_cell(
        &self,
        ctx: &Context<'_>,
        update_options: CellUpdateOptions,
    ) -> Result<Cell> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let cell = Cell::update(&mut transaction, &update_options).await?;

        transaction.commit().await?;
        Ok(cell)
    }
}
