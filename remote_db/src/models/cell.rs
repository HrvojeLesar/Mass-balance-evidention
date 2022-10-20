use std::sync::Arc;

use anyhow::Result;
use async_graphql::{Context, Enum, InputObject, Object, SimpleObject};
use async_trait::async_trait;
use chrono::{DateTime, Utc};

use sqlx::{query_builder::Separated, FromRow, Postgres, Row, Transaction};

use crate::DatabasePool;

use super::{
    data_group::DataGroup,
    db_query::{DatabaseQueries, QueryBuilderHelpers},
    DeleteOptions, FetchMany, FetchOptions, FieldsToSql, OptionalId, Pagination,
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
    pub(super) d_group: Option<Arc<DataGroup>>,
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
    pub(super) d_group: Option<i32>,
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

    type DO = DeleteOptions;

    type GetManyResult = Cells;

    async fn insert(
        executor: &mut Transaction<'_, Postgres>,
        options: &CellInsertOptions,
    ) -> Result<Self> {
        let rec = sqlx::query!(
            "
            INSERT INTO cell (name, description, d_group)
            VALUES ($1, $2, $3)
            RETURNING *
            ",
            options.name,
            options.description,
            options.d_group,
        )
        .fetch_one(&mut *executor)
        .await?;

        let d_group = if let Some(id) = options.d_group {
            Some(Arc::new(DataGroup::get(&mut *executor, id).await?))
        } else {
            None
        };

        Ok(Self {
            id: rec.id,
            name: rec.name,
            description: rec.description,
            created_at: rec.created_at,
            d_group,
        })
    }

    async fn get_many(
        executor: &mut Transaction<'_, Postgres>,
        options: &CellFetchOptions,
    ) -> Result<Cells> {
        let mut builder = sqlx::QueryBuilder::new("SELECT *, COUNT(*) OVER() as total_count FROM ");
        Self::handle_fetch_options_with_score(options, "cell", "id", &mut builder);

        let r = builder.build().fetch_all(&mut *executor).await?;

        let total = match r.first() {
            Some(t) => t.try_get("total_count")?,
            None => 0,
        };

        let d_group = if let Some(id) = options.data_group_id {
            Some(Arc::new(DataGroup::get(&mut *executor, id).await?))
        } else {
            None
        };

        let mut cells = Vec::with_capacity(r.len());
        for c in r.into_iter() {
            cells.push(Cell {
                id: c.try_get("id")?,
                name: c.try_get("name")?,
                description: c.try_get("description")?,
                created_at: c.try_get("created_at")?,
                d_group: d_group.clone(),
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
        let rec = sqlx::query!(
            "
            SELECT * FROM cell
            WHERE id = $1
            ",
            options.id.id,
        )
        .fetch_one(&mut *executor)
        .await?;

        let d_group = if let Some(id) = rec.d_group {
            Some(Arc::new(DataGroup::get(&mut *executor, id).await?))
        } else {
            None
        };

        Ok(Self {
            id: rec.id,
            name: rec.name,
            description: rec.description,
            created_at: rec.created_at,
            d_group,
        })
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

        let query = builder.build();
        let rec = query.fetch_one(&mut *executor).await?;

        let d_group = if let Some(id) = rec.try_get("d_group")? {
            Some(Arc::new(DataGroup::get(&mut *executor, id).await?))
        } else {
            None
        };

        Ok(Self {
            id: rec.try_get("id")?,
            name: rec.try_get("name")?,
            description: rec.try_get("description")?,
            created_at: rec.try_get("created_at")?,
            d_group,
        })
    }

    async fn delete(
        executor: &mut Transaction<'_, Postgres>,
        options: &DeleteOptions,
    ) -> Result<Self> {
        let mut builder: sqlx::QueryBuilder<Postgres> =
            sqlx::QueryBuilder::new("DELETE FROM cell ");
        builder
            .push("WHERE id = ")
            .push_bind(options.id)
            .push("RETURNING *");

        let query = builder.build();
        let rec = query.fetch_one(&mut *executor).await?;

        let d_group = if let Some(id) = rec.try_get("d_group")? {
            Some(Arc::new(DataGroup::get(&mut *executor, id).await?))
        } else {
            None
        };

        Ok(Self {
            id: rec.try_get("id")?,
            name: rec.try_get("name")?,
            description: rec.try_get("description")?,
            created_at: rec.try_get("created_at")?,
            d_group,
        })
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

        let mut builder = sqlx::QueryBuilder::new("SELECT *, COUNT(*) OVER() as total_count FROM ");

        Cell::filter_and_order_with_score(
            "cell",
            &fetch_options,
            "name",
            &mut builder,
            None,
            None,
            Some(|separator: &mut Separated<_, &str>| {
                separator
                    .push(
                        "cell.id NOT IN 
                    (
                        SELECT id_cell FROM cell_culture_pair
                        WHERE cell_culture_pair.id_culture = ",
                    )
                    .push_bind_unseparated(fetch_options.id.id)
                    .push_unseparated(" ) ");
            }),
        );
        Cell::paginate(fetch_options.limit, fetch_options.page, &mut builder);

        let r = builder.build().fetch_all(&mut transaction).await?;

        let total = match r.first() {
            Some(t) => t.try_get("total_count")?,
            None => 0,
        };

        let d_group = if let Some(id) = fetch_options.data_group_id {
            Some(Arc::new(DataGroup::get(&mut transaction, id).await?))
        } else {
            None
        };

        let mut cells = Vec::with_capacity(r.len());
        for c in r.into_iter() {
            cells.push(Cell {
                id: c.try_get("id")?,
                name: c.try_get("name")?,
                description: c.try_get("description")?,
                created_at: c.try_get("created_at")?,
                d_group: d_group.clone(),
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
                id: OptionalId { id: None },
                limit: fetch_options.limit,
                page: fetch_options.page,
                ordering: fetch_options.ordering,
                filters: fetch_options.filters,
                data_group_id: fetch_options.data_group_id,
            };
            resp = Cell::get_many(&mut transaction, &fetch_options).await;
        } else {
            let mut builder =
                sqlx::QueryBuilder::new("SELECT *, COUNT(*) OVER() as total_count FROM ");

            Cell::filter_and_order_with_score(
                "cell",
                &fetch_options,
                "name",
                &mut builder,
                None,
                None,
                Some(|separator: &mut Separated<_, &str>| {
                    separator
                        .push(
                            "cell.id IN 
                                (
                                    SELECT id_cell FROM cell_culture_pair
                                    WHERE cell_culture_pair.id_culture = ",
                        )
                        .push_bind_unseparated(fetch_options.id.id)
                        .push_unseparated(" ) ");
                }),
            );
            Cell::paginate(fetch_options.limit, fetch_options.page, &mut builder);

            let r = builder.build().fetch_all(&mut transaction).await?;

            let total = match r.first() {
                Some(t) => t.try_get("total_count")?,
                None => 0,
            };

            let d_group = if let Some(id) = fetch_options.data_group_id {
                Some(Arc::new(DataGroup::get(&mut transaction, id).await?))
            } else {
                None
            };

            let mut cells = Vec::with_capacity(r.len());
            for c in r.into_iter() {
                cells.push(Cell {
                    id: c.try_get("id")?,
                    name: c.try_get("name")?,
                    description: c.try_get("description")?,
                    created_at: c.try_get("created_at")?,
                    d_group: d_group.clone(),
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

    async fn delete_cell(&self, ctx: &Context<'_>, delete_options: DeleteOptions) -> Result<Cell> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let res = Cell::delete(&mut transaction, &delete_options).await?;

        transaction.commit().await?;
        Ok(res)
    }
}
