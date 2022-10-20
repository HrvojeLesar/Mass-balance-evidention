use std::sync::Arc;

use anyhow::Result;
use async_graphql::{Context, Enum, InputObject, Object, SimpleObject};
use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::{query_builder::Separated, FromRow, Postgres, Row, Transaction};

use crate::DatabasePool;

use super::{
    cell::{Cell, CellFields},
    culture::{Culture, CultureFields},
    data_group::DataGroup,
    db_query::{DatabaseQueries, QueryBuilderHelpers},
    DeleteOptions, FetchMany, FetchOptions, FieldsToSql, OptionalId, Pagination,
};

pub(super) type CellCulturePairFetchOptions =
    FetchOptions<CellCulturePairFields, OptionalCellCulturePairIds, CellCultureOrderingFields>;
type CellCulturePairs = FetchMany<CellCulturePair>;

#[derive(InputObject)]
pub(super) struct OptionalCellCulturePairIds {
    pub cell_id: Option<i32>,
    pub culture_id: Option<i32>,
    /// Data group should be provided when fetching many
    /// pairs as NULL is not a value that will return any results
    pub d_group: Option<i32>,
}

#[derive(InputObject)]
pub(super) struct CellCulturePairIds {
    pub cell_id: i32,
    pub culture_id: i32,
    pub d_group: i32,
}

#[derive(SimpleObject, FromRow, Debug)]
pub(super) struct CellCulturePair {
    pub(super) cell: Option<Cell>,
    pub(super) culture: Option<Culture>,
    pub(super) created_at: DateTime<Utc>,
    pub(super) d_group: Option<Arc<DataGroup>>,
}

#[derive(Enum, Clone, Copy, PartialEq, Eq)]
pub(super) enum CellCulturePairFields {
    CellName,
    CellDescription,
    CultureName,
    CultureDescription,
}

impl FieldsToSql for CellCulturePairFields {}

impl ToString for CellCulturePairFields {
    fn to_string(&self) -> String {
        match self {
            Self::CellName => "cell.name".to_string(),
            Self::CellDescription => "cell.description".to_string(),
            Self::CultureName => "culture.name".to_string(),
            Self::CultureDescription => "culture.description".to_string(),
        }
    }
}

#[derive(Enum, Clone, Copy, PartialEq, Eq)]
pub(super) enum CellCultureOrderingFields {
    CellName,
    CellDescription,
    CultureName,
    CultureDescription,
}

impl FieldsToSql for CellCultureOrderingFields {}

impl ToString for CellCultureOrderingFields {
    fn to_string(&self) -> String {
        match self {
            Self::CellName => "c_name".to_string(),
            Self::CellDescription => "c_desc".to_string(),
            Self::CultureName => "cu_name".to_string(),
            Self::CultureDescription => "cu_desc".to_string(),
        }
    }
}

#[derive(InputObject)]
pub(super) struct CellCulturePairInsertOptions {
    pub(super) id_cell: i32,
    pub(super) id_culture: i32,
    pub(super) d_group: i32,
}

#[derive(InputObject)]
pub(super) struct CellCulturePairUpdateOptions {
    pub(super) id_cell_new: i32,
    pub(super) id_culture_new: i32,
    pub(super) id_cell_old: i32,
    pub(super) id_culture_old: i32,
    pub(super) id_d_group: i32,
}

impl QueryBuilderHelpers<'_, Postgres> for CellCulturePair {}

#[async_trait]
impl DatabaseQueries<Postgres> for CellCulturePair {
    type IO = CellCulturePairInsertOptions;

    type FO = CellCulturePairFetchOptions;

    type UO = CellCulturePairUpdateOptions;

    type DO = DeleteOptions<CellCulturePairIds>;

    type GetManyResult = CellCulturePairs;

    async fn insert(
        executor: &mut Transaction<'_, Postgres>,
        options: &CellCulturePairInsertOptions,
    ) -> Result<Self> {
        let rec = sqlx::query!(
            "
            INSERT INTO cell_culture_pair (id_cell, id_culture, d_group)
            VALUES ($1, $2, $3)
            RETURNING *
            ",
            options.id_cell,
            options.id_culture,
            options.d_group,
        )
        .fetch_one(&mut *executor)
        .await?;

        let cc = sqlx::query!(
            "
            SELECT
                cell.id as c_id,
                cell.name as c_name,
                cell.description as c_desc,
                cell.created_at as c_created_at,
                culture.id as cu_id,
                culture.name as cu_name,
                culture.description as cu_desc,
                culture.created_at as cu_created_at,
                data_group.id as dg_id,
                data_group.name as dg_name,
                data_group.description as dg_desc,
                data_group.created_at as dg_created_at
            FROM
                cell, culture, data_group
            WHERE
                cell.id = $1 AND culture.id = $2 AND data_group.id = $3
            ",
            rec.id_cell,
            rec.id_culture,
            rec.d_group
        )
        .fetch_one(&mut *executor)
        .await?;

        let data_group = Arc::new(DataGroup {
            id: cc.dg_id,
            name: cc.dg_name,
            description: cc.dg_desc,
            created_at: cc.dg_created_at,
        });

        Ok(Self {
            created_at: rec.created_at,
            cell: Some(Cell {
                id: cc.c_id,
                name: cc.c_name,
                description: cc.c_desc,
                created_at: cc.c_created_at,
                d_group: Some(data_group.clone()),
            }),
            culture: Some(Culture {
                id: cc.cu_id,
                name: cc.cu_name,
                description: cc.cu_desc,
                created_at: cc.cu_created_at,
                d_group: Some(data_group.clone()),
            }),
            d_group: Some(data_group),
        })
    }

    async fn get_many(
        executor: &mut Transaction<'_, Postgres>,
        options: &CellCulturePairFetchOptions,
    ) -> Result<CellCulturePairs> {
        let mut builder = sqlx::QueryBuilder::new("SELECT *, COUNT(*) OVER() as total_count FROM ");
        Self::filter_and_order_with_score(
            "cell_culture_pair",
            options,
            "id_cell",
            &mut builder,
            Some(
                "
                id_cell,
                id_culture,
                cell_culture_pair.created_at,
                cell.id as c_id,
                cell.name as c_name,
                cell.description as c_desc,
                cell.created_at as c_created_at,
                culture.id as cu_id,
                culture.name as cu_name,
                culture.description as cu_desc,
                culture.created_at as cu_created_at,
                cell_culture_pair.d_group
                ",
            ),
            Some(
                "
                INNER JOIN cell ON cell.id = cell_culture_pair.id_cell
                INNER JOIN culture ON culture.id = cell_culture_pair.id_culture
                ",
            ),
            Some(|separator: &mut Separated<_, &str>| {
                if let Some(id) = options.data_group_id {
                    separator
                        .push("cell_culture_pair.d_group = ")
                        .push_bind_unseparated(id);
                } else {
                    separator.push("cell_culture_pair.d_group = 1 ");
                }
            }),
        );
        Self::paginate(options.limit, options.page, &mut builder);

        let rows = builder.build().fetch_all(&mut *executor).await?;

        let total = match rows.first() {
            Some(t) => t.try_get("total_count")?,
            None => 0,
        };

        let d_group = if let Some(id) = options.data_group_id {
            Some(Arc::new(DataGroup::get(&mut *executor, id).await?))
        } else {
            None
        };

        let mut pairs = Vec::with_capacity(rows.len());
        for p in rows.into_iter() {
            pairs.push(CellCulturePair {
                created_at: p.try_get("created_at")?,
                cell: Some(Cell {
                    id: p.try_get("c_id")?,
                    name: p.try_get("c_name")?,
                    description: p.try_get("c_desc")?,
                    created_at: p.try_get("c_created_at")?,
                    d_group: d_group.clone(),
                }),
                culture: Some(Culture {
                    id: p.try_get("cu_id")?,
                    name: p.try_get("cu_name")?,
                    description: p.try_get("cu_desc")?,
                    created_at: p.try_get("cu_created_at")?,
                    d_group: d_group.clone(),
                }),
                d_group: d_group.clone(),
            });
        }

        Ok(CellCulturePairs {
            pagination: Pagination {
                limit: options.limit.unwrap_or_default(),
                page: options.page.unwrap_or_default(),
                total,
            },
            results: pairs,
        })
    }

    async fn get(
        executor: &mut Transaction<'_, Postgres>,
        options: &CellCulturePairFetchOptions,
    ) -> Result<Self> {
        let r = sqlx::query!(
            "
            SELECT 
                id_cell,
                id_culture,
                cell_culture_pair.created_at,
                cell.id as c_id,
                cell.name as c_name,
                cell.description as c_desc,
                cell.created_at as c_created_at,
                culture.id as cu_id,
                culture.name as cu_name,
                culture.description as cu_desc,
                culture.created_at as cu_created_at,
                cell_culture_pair.d_group as ccp_d_group
            FROM 
                cell_culture_pair
            INNER JOIN cell ON cell.id = cell_culture_pair.id_cell
            INNER JOIN culture ON culture.id = cell_culture_pair.id_culture
            WHERE 
                cell_culture_pair.id_cell = $1 AND
                cell_culture_pair.id_culture = $2 AND
                cell_culture_pair.d_group = $3
            ",
            options.id.cell_id,
            options.id.culture_id,
            options.id.d_group,
        )
        .fetch_one(&mut *executor)
        .await?;

        let d_group = Some(Arc::new(
            DataGroup::get(&mut *executor, r.ccp_d_group).await?,
        ));

        Ok(Self {
            created_at: r.created_at,
            cell: Some(Cell {
                id: r.c_id,
                name: r.c_name,
                description: r.c_desc,
                created_at: r.c_created_at,
                d_group: d_group.clone(),
            }),
            culture: Some(Culture {
                id: r.cu_id,
                name: r.cu_name,
                description: r.cu_desc,
                created_at: r.cu_created_at,
                d_group: d_group.clone(),
            }),
            d_group,
        })
    }

    async fn update(
        executor: &mut Transaction<'_, Postgres>,
        options: &CellCulturePairUpdateOptions,
    ) -> Result<Self> {
        let cell_culture_new_ids = sqlx::query!(
            "
            UPDATE cell_culture_pair
            SET id_cell = $1, id_culture = $2 
            WHERE 
            id_cell = $3 AND 
            id_culture = $4 AND
            d_group = $5
            RETURNING id_cell, id_culture, d_group
            ",
            options.id_cell_new,
            options.id_culture_new,
            options.id_cell_old,
            options.id_culture_old,
            options.id_d_group,
        )
        .fetch_one(&mut *executor)
        .await?;

        Self::get(
            executor,
            &CellCulturePairFetchOptions {
                id: OptionalCellCulturePairIds {
                    cell_id: Some(cell_culture_new_ids.id_cell),
                    culture_id: Some(cell_culture_new_ids.id_culture),
                    d_group: Some(cell_culture_new_ids.d_group),
                },
                data_group_id: Some(cell_culture_new_ids.d_group),
                page: None,
                limit: None,
                filters: None,
                ordering: None,
            },
        )
        .await
    }

    async fn delete(
        executor: &mut Transaction<'_, Postgres>,
        options: &DeleteOptions<CellCulturePairIds>,
    ) -> Result<Self> {
        let deleted_data = sqlx::query!(
            "
            DELETE FROM cell_culture_pair
            WHERE 
            id_cell = $1 AND
            id_culture = $2 AND
            d_group = $3
            RETURNING id_cell, id_culture, created_at, d_group
            ",
            options.id.cell_id,
            options.id.culture_id,
            options.id.d_group
        )
        .fetch_one(&mut *executor)
        .await?;

        let d_group = Some(Arc::new(
            DataGroup::get(&mut *executor, deleted_data.d_group).await?,
        ));

        let cell = Cell::get(
            &mut *executor,
            &FetchOptions::<CellFields> {
                id: OptionalId {
                    id: Some(deleted_data.id_cell),
                },
                data_group_id: Some(deleted_data.d_group),
                page: None,
                limit: None,
                filters: None,
                ordering: None,
            },
        )
        .await?;

        let culture = Culture::get(
            &mut *executor,
            &FetchOptions::<CultureFields> {
                id: OptionalId {
                    id: Some(deleted_data.id_culture),
                },
                data_group_id: Some(deleted_data.d_group),
                page: None,
                limit: None,
                filters: None,
                ordering: None,
            },
        )
        .await?;

        Ok(CellCulturePair {
            cell: Some(cell),
            culture: Some(culture),
            created_at: deleted_data.created_at,
            d_group,
        })
    }
}

#[derive(Default)]
pub struct CellCulturePairQuery;

#[Object]
impl CellCulturePairQuery {
    async fn cell_culture_pairs(
        &self,
        ctx: &Context<'_>,
        fetch_options: CellCulturePairFetchOptions,
    ) -> Result<CellCulturePairs> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let res = CellCulturePair::get_many(&mut transaction, &fetch_options).await?;

        transaction.commit().await?;
        Ok(res)
    }

    async fn cell_culture(
        &self,
        ctx: &Context<'_>,
        fetch_options: CellCulturePairFetchOptions,
    ) -> Result<CellCulturePair> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let res = CellCulturePair::get(&mut transaction, &fetch_options).await?;

        transaction.commit().await?;
        Ok(res)
    }

    async fn get_all_cell_culture_pairs(
        &self,
        ctx: &Context<'_>,
        fetch_options: CellCulturePairFetchOptions,
    ) -> Result<CellCulturePairs> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let mut builder = sqlx::QueryBuilder::new("SELECT *, COUNT(*) OVER() as total_count FROM ");
        CellCulturePair::filter_and_order_with_score(
            "cell_culture_pair",
            &fetch_options,
            "id_cell",
            &mut builder,
            Some(
                "
                id_cell,
                id_culture,
                cell_culture_pair.created_at,
                cell.id as c_id,
                cell.name as c_name,
                cell.description as c_desc,
                cell.created_at as c_created_at,
                culture.id as cu_id,
                culture.name as cu_name,
                culture.description as cu_desc,
                culture.created_at as cu_created_at,
                cell_culture_pair.d_group
                ",
            ),
            Some(
                "
                INNER JOIN cell ON cell.id = cell_culture_pair.id_cell
                INNER JOIN culture ON culture.id = cell_culture_pair.id_culture
                ",
            ),
            Some(|separator: &mut Separated<_, &str>| {
                if let Some(id) = fetch_options.data_group_id {
                    separator
                        .push("cell_culture_pair.d_group = ")
                        .push_bind_unseparated(id);
                } else {
                    separator.push("cell_culture_pair.d_group = 1 ");
                }
            }),
        );

        let rows = builder.build().fetch_all(&mut transaction).await?;

        let total = match rows.first() {
            Some(t) => t.try_get("total_count")?,
            None => 0,
        };

        let d_group = Some(Arc::new(
            DataGroup::get(&mut transaction, fetch_options.data_group_id.unwrap_or(1)).await?,
        ));

        let mut pairs = Vec::with_capacity(rows.len());
        for p in rows.into_iter() {
            pairs.push(CellCulturePair {
                created_at: p.try_get("created_at")?,
                cell: Some(Cell {
                    id: p.try_get("c_id")?,
                    name: p.try_get("c_name")?,
                    description: p.try_get("c_desc")?,
                    created_at: p.try_get("c_created_at")?,
                    d_group: d_group.clone(),
                }),
                culture: Some(Culture {
                    id: p.try_get("cu_id")?,
                    name: p.try_get("cu_name")?,
                    description: p.try_get("cu_desc")?,
                    created_at: p.try_get("cu_created_at")?,
                    d_group: d_group.clone(),
                }),
                d_group: d_group.clone(),
            });
        }

        let res = Ok(CellCulturePairs {
            pagination: Pagination {
                limit: fetch_options.limit.unwrap_or_default(),
                page: fetch_options.page.unwrap_or_default(),
                total,
            },
            results: pairs,
        });

        transaction.commit().await?;

        res
    }
}

#[derive(Default)]
pub struct CellCulturePairMutation;

#[Object]
impl CellCulturePairMutation {
    async fn insert_cell_culture_pair(
        &self,
        ctx: &Context<'_>,
        insert_options: CellCulturePairInsertOptions,
    ) -> Result<CellCulturePair> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let res = CellCulturePair::insert(&mut transaction, &insert_options).await?;

        transaction.commit().await?;

        Ok(res)
    }

    async fn update_cell_culture_pair(
        &self,
        ctx: &Context<'_>,
        update_options: CellCulturePairUpdateOptions,
    ) -> Result<CellCulturePair> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let res = CellCulturePair::update(&mut transaction, &update_options).await?;

        transaction.commit().await?;
        Ok(res)
    }

    async fn delete_cell_culture_pair(
        &self,
        ctx: &Context<'_>,
        delete_options: DeleteOptions<CellCulturePairIds>,
    ) -> Result<CellCulturePair> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let res = CellCulturePair::delete(&mut transaction, &delete_options).await?;

        transaction.commit().await?;
        Ok(res)
    }
}
