use anyhow::Result;
use async_graphql::{Context, Enum, InputObject, Object, SimpleObject};
use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::{FromRow, Postgres, Row, Transaction};

use crate::{models::MAX_LIMIT, DatabasePool};

use super::{
    cell::Cell,
    culture::Culture,
    db_query::{DatabaseQueries, QueryBuilderHelpers},
    FetchMany, FetchOptions, FieldsToSql, Pagination, DEFAULT_LIMIT,
};

pub(super) type CellCulturePairFetchOptions =
    FetchOptions<CellCulturePairFields, CellCulturePairIds>;
type CellCulturePairs = FetchMany<CellCulturePair>;

#[derive(InputObject)]
pub struct CellCulturePairIds {
    pub cell_id: Option<i32>,
    pub culture_id: Option<i32>,
}

#[derive(SimpleObject, FromRow, Debug)]
pub(super) struct CellCulturePair {
    pub(super) cell: Option<Cell>,
    pub(super) culture: Option<Culture>,
    pub(super) created_at: DateTime<Utc>,
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

#[derive(InputObject)]
pub(super) struct CellCulturePairInsertOptions {
    pub(super) id_cell: i32,
    pub(super) id_culture: i32,
}

#[derive(InputObject)]
pub(super) struct CellCulturePairUpdateOptions {
    pub(super) id_cell_new: i32,
    pub(super) id_culture_new: i32,
    pub(super) id_cell_old: i32,
    pub(super) id_culture_old: i32,
}

impl QueryBuilderHelpers<'_, Postgres> for CellCulturePair {}

#[async_trait]
impl DatabaseQueries<Postgres> for CellCulturePair {
    type IO = CellCulturePairInsertOptions;

    type FO = CellCulturePairFetchOptions;

    type UO = CellCulturePairUpdateOptions;

    type GetManyResult = CellCulturePairs;

    async fn insert(
        executor: &mut Transaction<'_, Postgres>,
        options: &CellCulturePairInsertOptions,
    ) -> Result<Self> {
        let rec = sqlx::query!(
            "
            INSERT INTO cell_culture_pair (id_cell, id_culture)
            VALUES ($1, $2)
            RETURNING *
            ",
            options.id_cell,
            options.id_culture,
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
                culture.created_at as cu_created_at
            FROM
                cell, culture
            WHERE
                cell.id = $1 AND culture.id = $2
            ",
            rec.id_cell,
            rec.id_culture
        )
        .fetch_one(&mut *executor)
        .await?;

        Ok(Self {
            created_at: rec.created_at,
            cell: Some(Cell {
                id: cc.c_id,
                name: cc.c_name,
                description: cc.c_desc,
                created_at: cc.c_created_at,
            }),
            culture: Some(Culture {
                id: cc.cu_id,
                name: cc.cu_name,
                description: cc.cu_desc,
                created_at: cc.cu_created_at,
            }),
        })
    }

    async fn get_many(
        executor: &mut Transaction<'_, Postgres>,
        options: &CellCulturePairFetchOptions,
    ) -> Result<CellCulturePairs> {
        let mut builder = sqlx::QueryBuilder::new(
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
                COUNT(*) OVER() as total_count
            FROM 
                cell_culture_pair
            INNER JOIN cell ON cell.id = cell_culture_pair.id_cell
            INNER JOIN culture ON culture.id = cell_culture_pair.id_culture
            ",
        );
        Self::handle_fetch_options(&options, "id_cell", &mut builder);

        let rows = builder.build().fetch_all(executor).await?;

        let total = match rows.first() {
            Some(t) => t.try_get("total_count")?,
            None => 0,
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
                }),
                culture: Some(Culture {
                    id: p.try_get("cu_id")?,
                    name: p.try_get("cu_name")?,
                    description: p.try_get("cu_desc")?,
                    created_at: p.try_get("cu_created_at")?,
                }),
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
                culture.created_at as cu_created_at
            FROM 
                cell_culture_pair
            INNER JOIN cell ON cell.id = cell_culture_pair.id_cell
            INNER JOIN culture ON culture.id = cell_culture_pair.id_culture
            WHERE 
                cell_culture_pair.id_cell = $1 AND
                cell_culture_pair.id_culture = $2
            ",
            options.id.cell_id,
            options.id.culture_id,
        )
        .fetch_one(executor)
        .await?;

        Ok(Self {
            created_at: r.created_at,
            cell: Some(Cell {
                id: r.c_id,
                name: r.c_name,
                description: r.c_desc,
                created_at: r.c_created_at,
            }),
            culture: Some(Culture {
                id: r.cu_id,
                name: r.cu_name,
                description: r.cu_desc,
                created_at: r.cu_created_at,
            }),
        })
    }

    async fn update(
        executor: &mut Transaction<'_, Postgres>,
        options: &CellCulturePairUpdateOptions,
    ) -> Result<Self> {
        let rec = sqlx::query!(
            "
            UPDATE cell_culture_pair
            SET id_cell = $1, id_culture = $2 
            WHERE 
            id_cell = $3 AND 
            id_culture = $4
            RETURNING id_cell, id_culture
            ",
            options.id_cell_new,
            options.id_culture_new,
            options.id_cell_old,
            options.id_culture_old,
        )
        .fetch_one(&mut *executor)
        .await?;

        todo!()
        // Ok(Self::get(
        //     &mut *executor,
        //     &CellCulturePairFetchOptions {
        //         id_cell: rec.id_cell,
        //         id_culture: rec.id_culture,
        //         limit: None,
        //     },
        // )
        // .await?)
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

        let ccp = CellCulturePair::get_many(&mut transaction, &fetch_options).await?;

        transaction.commit().await?;
        Ok(ccp)
    }

    async fn cell_culture(
        &self,
        ctx: &Context<'_>,
        fetch_options: CellCulturePairFetchOptions,
    ) -> Result<CellCulturePair> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let ccp = CellCulturePair::get(&mut transaction, &fetch_options).await?;

        transaction.commit().await?;
        Ok(ccp)
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

        let ccp = CellCulturePair::insert(&mut transaction, &insert_options).await?;

        transaction.commit().await?;

        Ok(ccp)
    }

    async fn update_cell_culture_pair(
        &self,
        ctx: &Context<'_>,
        update_options: CellCulturePairUpdateOptions,
    ) -> Result<CellCulturePair> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let ccp = CellCulturePair::update(&mut transaction, &update_options).await?;

        transaction.commit().await?;
        Ok(ccp)
    }
}
