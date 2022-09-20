use anyhow::Result;
use async_graphql::{Context, Enum, InputObject, Object, SimpleObject};
use async_trait::async_trait;
use chrono::{DateTime, Utc};

use sqlx::{FromRow, Postgres, Transaction};

use crate::DatabasePool;

use super::{
    calc_limit, calc_offset, db_query::DatabaseQueries, FetchOptions, FieldsToSql, Pagination, FetchMany,
};

type CellFetchOptions = FetchOptions<CellFields>;
type Cells = FetchMany<CellFields>;

#[derive(SimpleObject, FromRow, Debug)]
pub(super) struct Cell {
    pub(super) id: i32,
    pub(super) name: String,
    pub(super) description: Option<String>,
    pub(super) created_at: DateTime<Utc>,
}

#[derive(Enum, Clone, Copy, PartialEq, Eq)]
pub(super) enum CellFields {
    Name,
    Description,
}

impl FieldsToSql for CellFields {
    fn to_sql(&self) -> String {
        match self {
            Self::Name => "name % ".to_string(),
            Self::Description => "description % ".to_string(),
        }
    }
}

impl Into<String> for CellFields {
    fn into(self) -> String {
        match self {
            Self::Name => "name % ".to_string(),
            Self::Description => "description % ".to_string(),
        }
    }
}

#[derive(InputObject)]
pub(super) struct CellInsertOptions {
    pub(super) name: String,
    pub(super) description: Option<String>,
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

    type GetManyResult = Cells;

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
    ) -> Result<Cells> {
        // let limit = calc_limit(options.limit);
        // let offset = calc_offset(options.page, options.limit);
        // let mut builder =
        //     sqlx::QueryBuilder::new("SELECT *, COUNT(*) OVER () as total_count FROM cell");
        //
        // if let Some(filters) = &options.filters {
        //     builder.push("WHERE ");
        //     let mut sep = builder.separated(" AND ");
        // }
        // let limit = options.limit.unwrap_or(DEFAULT_LIMIT);
        // Ok(sqlx::query_as!(
        //     Self,
        //     "
        //     SELECT * FROM cell
        //     WHERE id >= $1
        //     ORDER BY id ASC
        //     LIMIT $2
        //     ",
        //     options.id.unwrap_or(0),
        //     if limit <= MAX_LIMIT {
        //         limit
        //     } else {
        //         DEFAULT_LIMIT
        //     }
        // )
        // .fetch_all(executor)
        // .await?)
        todo!()
    }

    async fn get(
        executor: &mut Transaction<'_, Postgres>,
        options: &CellFetchOptions,
    ) -> Result<Self> {
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
    async fn cells(&self, ctx: &Context<'_>, fetch_options: CellFetchOptions) -> Result<Vec<Cell>> {
        // let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        // let mut transaction = pool.begin().await?;
        //
        // let cells = Cell::get_many(&mut transaction, &fetch_options).await?;
        //
        // transaction.commit().await?;
        // Ok(cells)
        todo!()
    }

    async fn cell(&self, ctx: &Context<'_>, fetch_options: CellFetchOptions) -> Result<Cell> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let cells = Cell::get(&mut transaction, &fetch_options).await?;

        transaction.commit().await?;
        Ok(cells)
    }
}

#[derive(Default)]
pub struct CellMutation;

#[derive(InputObject)]
#[graphql(input_name = "MyObjectInput")]
struct MyObject {
    value: i32,
}

#[Object]
impl MyObject {
    async fn value(&self) -> String {
        self.value.to_string()
    }
}

#[Object]
impl CellMutation {
    async fn insert_cell(&self, ctx: &Context<'_>, insert_options: MyObject) -> Result<Cell> {
        todo!()
        // let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        // let mut transaction = pool.begin().await?;
        //
        // let cell = Cell::insert(&mut transaction, &insert_options).await?;
        //
        // transaction.commit().await?;
        // Ok(cell)
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
