use anyhow::Result;
use async_graphql::{Context, Enum, InputObject, Object, SimpleObject};
use async_trait::async_trait;
use chrono::{DateTime, Utc};

use sqlx::{FromRow, Postgres, Row, Transaction};

use crate::DatabasePool;

use super::{
    db_query::{DatabaseQueries, QueryBuilderHelpers},
    FetchMany, FetchOptions, FieldsToSql, Id, Pagination,
};

type CellFetchOptions = FetchOptions<CellFields>;
type Cells = FetchMany<Cell>;
type CellFetchUnpairedOptions = FetchOptions<CellFields, CellUnpairedId>;

#[derive(InputObject)]
pub struct CellUnpairedId {
    /// Id refers to a Culture Id
    pub id: Option<i32>,
}

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

impl FieldsToSql for CellFields {}

impl ToString for CellFields {
    fn to_string(&self) -> String {
        match self {
            Self::Name => "name".to_string(),
            Self::Description => "description".to_string(),
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

impl QueryBuilderHelpers<'_, Postgres> for Cell {}

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
        let mut builder =
            sqlx::QueryBuilder::new("SELECT *, COUNT(*) OVER () as total_count FROM cell ");
        Self::handle_fetch_options(options, "id", &mut builder);
        let r = builder.build().fetch_all(executor).await?;

        let total = match r.first() {
            Some(t) => t.try_get("total_count")?,
            None => 0,
        };

        let mut cells = Vec::with_capacity(r.len());
        for c in r.into_iter() {
            cells.push(Cell {
                id: c.try_get("id")?,
                name: c.try_get("name")?,
                description: c.try_get("description")?,
                created_at: c.try_get("created_at")?,
            });
        }

        Ok(Cells {
            pagination: Pagination {
                limit: options.limit.unwrap_or_default(),
                page: options.page.unwrap_or_default(),
                total,
            },
            results: cells,
        })
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
            options.id.id
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
    async fn cells(&self, ctx: &Context<'_>, fetch_options: CellFetchOptions) -> Result<Cells> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let res = Cell::get_many(&mut transaction, &fetch_options).await?;

        transaction.commit().await?;
        Ok(res)
    }

    async fn cell(&self, ctx: &Context<'_>, fetch_options: CellFetchOptions) -> Result<Cell> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let res = Cell::get(&mut transaction, &fetch_options).await?;

        transaction.commit().await?;
        Ok(res)
    }

    async fn unpaired_cells(
        &self,
        ctx: &Context<'_>,
        fetch_options: CellFetchUnpairedOptions,
    ) -> Result<Cells> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let mut builder = sqlx::QueryBuilder::new(
            "
            SELECT *, COUNT(*) OVER() as total_count FROM cell 
            WHERE cell.id NOT IN
            (
                SELECT id_cell FROM cell_culture_pair
                WHERE cell_culture_pair.id_culture = ",
        );
        builder.push("").push_bind(fetch_options.id.id).push(" ) ");

        if let Some(filters) = &fetch_options.filters {
            builder.push("AND ");
            let mut sep = builder.separated(" AND ");
            for filter in filters {
                sep.push(&filter.field.to_sql())
                    .push_bind_unseparated(&filter.value);
            }
        }

        Cell::order_by(&fetch_options.ordering, "name", &mut builder);
        Cell::paginate(fetch_options.limit, fetch_options.page, &mut builder);
        let r = builder.build().fetch_all(&mut transaction).await?;

        let total = match r.first() {
            Some(t) => t.try_get("total_count")?,
            None => 0,
        };

        let mut cells = Vec::with_capacity(r.len());
        for c in r.into_iter() {
            cells.push(Cell {
                id: c.try_get("id")?,
                name: c.try_get("name")?,
                description: c.try_get("description")?,
                created_at: c.try_get("created_at")?,
            });
        }

        transaction.commit().await?;

        Ok(Cells {
            pagination: Pagination {
                limit: fetch_options.limit.unwrap_or_default(),
                page: fetch_options.page.unwrap_or_default(),
                total,
            },
            results: cells,
        })
    }

    async fn paired_cells(
        &self,
        ctx: &Context<'_>,
        fetch_options: CellFetchUnpairedOptions,
    ) -> Result<Cells> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let resp;
        if fetch_options.id.id.is_none() {
            let fetch_options = CellFetchOptions {
                id: Id { id: None },
                limit: fetch_options.limit,
                page: fetch_options.page,
                ordering: fetch_options.ordering,
                filters: fetch_options.filters,
            };
            resp = Cell::get_many(&mut transaction, &fetch_options).await;
        } else {
            let mut builder = sqlx::QueryBuilder::new(
                "
                SELECT *, COUNT(*) OVER() as total_count FROM cell 
                WHERE cell.id IN
                (
                    SELECT id_cell FROM cell_culture_pair
                    WHERE cell_culture_pair.id_culture = ",
            );
            builder.push("").push_bind(fetch_options.id.id).push(" ) ");

            if let Some(filters) = &fetch_options.filters {
                builder.push("AND ");
                let mut sep = builder.separated(" AND ");
                for filter in filters {
                    sep.push(&filter.field.to_sql())
                        .push_bind_unseparated(&filter.value);
                }
            }

            Cell::order_by(&fetch_options.ordering, "name", &mut builder);
            Cell::paginate(fetch_options.limit, fetch_options.page, &mut builder);
            let r = builder.build().fetch_all(&mut transaction).await?;

            let total = match r.first() {
                Some(t) => t.try_get("total_count")?,
                None => 0,
            };

            let mut cells = Vec::with_capacity(r.len());
            for c in r.into_iter() {
                cells.push(Cell {
                    id: c.try_get("id")?,
                    name: c.try_get("name")?,
                    description: c.try_get("description")?,
                    created_at: c.try_get("created_at")?,
                });
            }

            resp = Ok(Cells {
                pagination: Pagination {
                    limit: fetch_options.limit.unwrap_or_default(),
                    page: fetch_options.page.unwrap_or_default(),
                    total,
                },
                results: cells,
            });
        }
        transaction.commit().await?;
        resp
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

        let res = Cell::insert(&mut transaction, &insert_options).await?;

        transaction.commit().await?;
        Ok(res)
    }

    async fn update_cell(
        &self,
        ctx: &Context<'_>,
        update_options: CellUpdateOptions,
    ) -> Result<Cell> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let res = Cell::update(&mut transaction, &update_options).await?;

        transaction.commit().await?;
        Ok(res)
    }
}
