use anyhow::Result;
use async_graphql::{Context, Enum, InputObject, Object, SimpleObject};
use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::{FromRow, Postgres, Row, Transaction};

use crate::DatabasePool;

use super::{
    buyer::Buyer,
    cell::Cell,
    cell_culture_pair::{CellCulturePair, CellCulturePairInsertOptions},
    culture::Culture,
    db_query::{DatabaseQueries, QueryBuilderHelpers},
    FetchMany, FetchOptions, FieldsToSql, Pagination,
};

type EntryFetchOptions = FetchOptions<EntryFields>;
type Entries = FetchMany<Entry>;

#[derive(SimpleObject, FromRow)]
pub(super) struct Entry {
    pub(super) id: i32,
    pub(super) weight: Option<f64>,
    pub(super) weight_type: Option<String>,
    pub(super) date: DateTime<Utc>,
    pub(super) created_at: DateTime<Utc>,
    pub(super) buyer: Option<Buyer>,
    pub(super) cell_culture_pair: Option<CellCulturePair>,
}

#[derive(Enum, Clone, Copy, PartialEq, Eq)]
pub(super) enum EntryFields {
    Weight,
    Date,
    BuyerName,
    BuyerAddress,
    BuyerContact,
    CellName,
    CellDescription,
    CultureName,
    CultureDescription,
}

impl FieldsToSql for EntryFields {}

impl ToString for EntryFields {
    fn to_string(&self) -> String {
        match self {
            EntryFields::Weight => "weight".to_string(),
            EntryFields::Date => "date".to_string(),
            EntryFields::BuyerName => "buyer.name".to_string(),
            EntryFields::BuyerAddress => "buyer.address".to_string(),
            EntryFields::BuyerContact => "buyer.contact".to_string(),
            EntryFields::CellName => "cell.name".to_string(),
            EntryFields::CellDescription => "cell.description".to_string(),
            EntryFields::CultureName => "culture.name".to_string(),
            EntryFields::CultureDescription => "culture.description".to_string(),
        }
    }
}

#[derive(InputObject)]
pub(super) struct EntryInsertOptions {
    pub(super) date: DateTime<Utc>,
    pub(super) weight: Option<f64>,
    pub(super) weight_type: Option<String>,
    pub(super) id_buyer: Option<i32>,
    pub(super) cell_culture_pair: CellCulturePairInsertOptions,
}

#[derive(InputObject)]
pub(super) struct EntryUpdateOptions {
    pub(super) id: i32,
    pub(super) weight: Option<f64>,
    pub(super) weight_type: Option<String>,
    pub(super) date: Option<DateTime<Utc>>,
    pub(super) id_buyer: Option<i32>,
    pub(super) cell_culture_pair: Option<CellCulturePairInsertOptions>,
}

impl QueryBuilderHelpers<'_, Postgres> for Entry {}

#[async_trait]
impl DatabaseQueries<Postgres> for Entry {
    type IO = EntryInsertOptions;

    type FO = EntryFetchOptions;

    type UO = EntryUpdateOptions;

    type GetManyResult = Entries;

    async fn insert(
        executor: &mut Transaction<'_, Postgres>,
        options: &EntryInsertOptions,
    ) -> Result<Self> {
        let partial_entry = sqlx::query!(
            "
            INSERT INTO entry (date, weight, weight_type, id_buyer, id_cell, id_culture)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
            ",
            options.date,
            options.weight,
            options.weight_type,
            options.id_buyer,
            options.cell_culture_pair.id_cell,
            options.cell_culture_pair.id_culture,
        )
        .fetch_one(&mut *executor)
        .await?;

        Ok(Self::get(
            &mut *executor,
            &EntryFetchOptions {
                id: super::Id {
                    id: Some(partial_entry.id),
                },
                page: None,
                limit: None,
                filters: None,
                ordering: None,
            },
        )
        .await?)
    }

    async fn get_many(
        executor: &mut Transaction<'_, Postgres>,
        options: &EntryFetchOptions,
    ) -> Result<Entries> {
        let mut builder = sqlx::QueryBuilder::new(
            "
            SELECT
                entry.id as e_id,
                entry.weight as e_weight,
                entry.weight_type as e_weight_type,
                entry.date as e_date,
                entry.created_at as e_created_at,
                entry.id_buyer as e_id_buyer,
                entry.id_cell as e_id_cell,
                entry.id_culture as e_id_culture,
                buyer.id as b_id,
                buyer.name as b_name,
                buyer.address as b_address,
                buyer.contact as b_contact,
                buyer.created_at as b_created_at,
                cell.id as c_id,
                cell.name as c_name,
                cell.description as c_desc,
                cell.created_at as c_created_at,
                culture.id as cu_id,
                culture.name as cu_name,
                culture.description as cu_desc,
                culture.created_at as cu_created_at,
                cell_culture_pair.created_at as ccp_created_at,
                COUNT(*) OVER() as total_count
            FROM entry
            INNER JOIN buyer ON buyer.id = entry.id_buyer
            INNER JOIN cell ON cell.id = entry.id_cell
            INNER JOIN culture ON culture.id = entry.id_culture
            INNER JOIN cell_culture_pair ON
                cell_culture_pair.id_cell = entry.id_cell AND
                cell_culture_pair.id_culture = entry.id_culture
            ",
        );

        Self::handle_fetch_options(options, "entry.id", &mut builder);
        let rows = builder.build().fetch_all(executor).await?;

        let total = match rows.first() {
            Some(t) => t.try_get("total_count")?,
            None => 0,
        };

        let mut entries = Vec::with_capacity(rows.len());
        for e in rows.into_iter() {
            entries.push(Entry {
                id: e.try_get("e_id")?,
                weight: e.try_get("e_weight")?,
                weight_type: e.try_get("e_weight_type")?,
                date: e.try_get("e_date")?,
                created_at: e.try_get("e_created_at")?,
                buyer: Some(Buyer {
                    id: e.try_get("b_id")?,
                    name: e.try_get("b_name")?,
                    address: e.try_get("b_address")?,
                    contact: e.try_get("b_contact")?,
                    created_at: e.try_get("c_created_at")?,
                }),
                cell_culture_pair: Some(CellCulturePair {
                    created_at: e.try_get("ccp_created_at")?,
                    cell: Some(Cell {
                        id: e.try_get("c_id")?,
                        name: e.try_get("c_name")?,
                        description: e.try_get("c_desc")?,
                        created_at: e.try_get("c_created_at")?,
                    }),
                    culture: Some(Culture {
                        id: e.try_get("cu_id")?,
                        name: e.try_get("cu_name")?,
                        description: e.try_get("cu_desc")?,
                        created_at: e.try_get("cu_created_at")?,
                    }),
                }),
            })
        }

        Ok(Entries {
            pagination: Pagination {
                limit: options.limit.unwrap_or_default(),
                page: options.page.unwrap_or_default(),
                total,
            },
            results: entries,
        })
    }

    async fn get(
        executor: &mut Transaction<'_, Postgres>,
        options: &EntryFetchOptions,
    ) -> Result<Self> {
        let r = sqlx::query!(
            "
            SELECT 
                entry.id as e_id,
                entry.weight as e_weight,
                entry.weight_type as e_weight_type,
                entry.date as e_date,
                entry.created_at as e_created_at,
                entry.id_buyer as e_id_buyer,
                entry.id_cell as e_id_cell,
                entry.id_culture as e_id_culture,
                buyer.id as b_id,
                buyer.name as b_name,
                buyer.address as b_address,
                buyer.contact as b_contact,
                buyer.created_at as b_created_at,
                cell.id as c_id,
                cell.name as c_name,
                cell.description as c_desc,
                cell.created_at as c_created_at,
                culture.id as cu_id,
                culture.name as cu_name,
                culture.description as cu_desc,
                culture.created_at as cu_created_at,
                cell_culture_pair.created_at as ccp_created_at
            FROM entry
            INNER JOIN buyer ON buyer.id = entry.id_buyer
            INNER JOIN cell ON cell.id = entry.id_cell
            INNER JOIN culture ON culture.id = entry.id_culture
            INNER JOIN cell_culture_pair ON 
                cell_culture_pair.id_cell = entry.id_cell AND 
                cell_culture_pair.id_culture = entry.id_culture
            WHERE entry.id = $1
            ",
            options.id.id,
        )
        .fetch_one(&mut *executor)
        .await?;

        Ok(Self {
            id: r.e_id,
            weight: r.e_weight,
            weight_type: r.e_weight_type,
            date: r.e_date,
            created_at: r.e_created_at,
            buyer: Some(Buyer {
                id: r.b_id,
                name: r.b_name,
                address: r.b_address,
                contact: r.b_contact,
                created_at: r.c_created_at,
            }),
            cell_culture_pair: Some(CellCulturePair {
                created_at: r.ccp_created_at,
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
            }),
        })
    }

    async fn update(
        executor: &mut Transaction<'_, Postgres>,
        options: &EntryUpdateOptions,
    ) -> Result<Self> {
        let mut builder: sqlx::QueryBuilder<Postgres> =
            sqlx::QueryBuilder::new("UPDATE entry SET ");
        let mut sep = builder.separated(", ");
        if let Some(weight) = &options.weight {
            sep.push("weight = ").push_bind_unseparated(weight);
        }
        if let Some(weight_type) = &options.weight_type {
            sep.push("weight_type = ")
                .push_bind_unseparated(weight_type);
        }
        if let Some(date) = &options.date {
            sep.push("date = ").push_bind_unseparated(date);
        }
        if let Some(id_buyer) = &options.id_buyer {
            sep.push("id_buyer = ").push_bind_unseparated(id_buyer);
        }
        if let Some(ccp) = &options.cell_culture_pair {
            sep.push("id_cell = ").push_bind_unseparated(ccp.id_cell);
            sep.push("id_culture = ")
                .push_bind_unseparated(ccp.id_culture);
        }
        builder
            .push("WHERE id = ")
            .push_bind(options.id)
            .push("RETURNING id");

        let query = builder.build();
        let r = query.fetch_one(&mut *executor).await?;

        Ok(Self::get(
            &mut *executor,
            &EntryFetchOptions {
                id: super::Id {
                    id: Some(r.try_get("id")?),
                },
                page: None,
                limit: None,
                filters: None,
                ordering: None,
            },
        )
        .await?)
    }
}

#[derive(Default)]
pub struct EntryQuery;

#[Object]
impl EntryQuery {
    async fn entries(
        &self,
        ctx: &Context<'_>,
        fetch_options: EntryFetchOptions,
    ) -> Result<Entries> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let entry = Entry::get_many(&mut transaction, &fetch_options).await?;

        transaction.commit().await?;
        Ok(entry)
    }

    async fn entry(&self, ctx: &Context<'_>, fetch_options: EntryFetchOptions) -> Result<Entry> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let entry = Entry::get(&mut transaction, &fetch_options).await?;

        transaction.commit().await?;
        Ok(entry)
    }
}

#[derive(Default)]
pub struct EntryMutation;

#[Object]
impl EntryMutation {
    async fn insert_entry(
        &self,
        ctx: &Context<'_>,
        insert_options: EntryInsertOptions,
    ) -> Result<Entry> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let entry = Entry::insert(&mut transaction, &insert_options).await?;

        transaction.commit().await?;

        Ok(entry)
    }

    async fn update_entry(
        &self,
        ctx: &Context<'_>,
        update_options: EntryUpdateOptions,
    ) -> Result<Entry> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let entry = Entry::update(&mut transaction, &update_options).await?;

        transaction.commit().await?;
        Ok(entry)
    }
}
