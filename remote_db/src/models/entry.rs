use std::sync::Arc;

use anyhow::Result;
use async_graphql::{Context, Enum, InputObject, Object, OneofObject, SimpleObject};
use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::{query_builder::Separated, FromRow, Postgres, Row, Transaction};

use crate::DatabasePool;

use super::{
    buyer::Buyer,
    cell::Cell,
    cell_culture_pair::{CellCulturePair, CellCulturePairInsertOptions},
    culture::Culture,
    data_group::DataGroup,
    db_query::{DatabaseQueries, QueryBuilderHelpers},
    DeleteOptions, FetchMany, FetchOptions, FieldsToSql, OptionalId, Pagination,
};

type EntryFetchOptions = FetchOptions<EntryFields, EntryFetchIdOptions, EntryOrderingFields>;
type Entries = FetchMany<Entry>;
type EntryGroups = FetchMany<EntryGroup>;

#[derive(SimpleObject, FromRow)]
pub(super) struct Entry {
    pub(super) id: i32,
    pub(super) weight: Option<f64>,
    pub(super) weight_type: Option<String>,
    pub(super) date: DateTime<Utc>,
    pub(super) created_at: DateTime<Utc>,
    pub(super) buyer: Option<Buyer>,
    pub(super) cell_culture_pair: Option<CellCulturePair>,
    pub(super) d_group: Option<Arc<DataGroup>>,
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
            Self::Weight => "weight".to_string(),
            Self::Date => "date".to_string(),
            Self::BuyerName => "buyer.name".to_string(),
            Self::BuyerAddress => "buyer.address".to_string(),
            Self::BuyerContact => "buyer.contact".to_string(),
            Self::CellName => "cell.name".to_string(),
            Self::CellDescription => "cell.description".to_string(),
            Self::CultureName => "culture.name".to_string(),
            Self::CultureDescription => "culture.description".to_string(),
        }
    }
}

#[derive(Enum, Clone, Copy, PartialEq, Eq)]
pub(super) enum EntryOrderingFields {
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

impl FieldsToSql for EntryOrderingFields {}

impl ToString for EntryOrderingFields {
    fn to_string(&self) -> String {
        match self {
            Self::Weight => "e_weight".to_string(),
            Self::Date => "e_date".to_string(),
            Self::BuyerName => "b_name".to_string(),
            Self::BuyerAddress => "b_address".to_string(),
            Self::BuyerContact => "b_contact".to_string(),
            Self::CellName => "c_name".to_string(),
            Self::CellDescription => "c_desc".to_string(),
            Self::CultureName => "cu_name".to_string(),
            Self::CultureDescription => "cu_desc".to_string(),
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
    pub(super) d_group: Option<i32>,
}

#[derive(InputObject)]
pub(super) struct EntryUpdateOptions {
    pub(super) id: i32,
    pub(super) weight: Option<f64>,
    pub(super) weight_type: Option<String>,
    pub(super) date: Option<DateTime<Utc>>,
    pub(super) id_buyer: Option<i32>,
    pub(super) cell_culture_pair: Option<CellCulturePairInsertOptions>,
    pub(super) d_group: Option<i32>,
}

#[derive(Enum, Clone, Copy, PartialEq, Eq)]
pub(super) enum EntryGroupOptions {
    Cell,
    Culture,
    Buyer,
}

impl FieldsToSql for EntryGroupOptions {
    fn to_sql(&self) -> String {
        match self {
            EntryGroupOptions::Cell => "entry.id_cell, cell.name ".to_string(),
            EntryGroupOptions::Culture => "entry.id_culture, culture.name ".to_string(),
            EntryGroupOptions::Buyer => "entry.id_buyer, buyer.name ".to_string(),
        }
    }
}

impl ToString for EntryGroupOptions {
    fn to_string(&self) -> String {
        match self {
            EntryGroupOptions::Cell => "cell".to_string(),
            EntryGroupOptions::Culture => "culture".to_string(),
            EntryGroupOptions::Buyer => "buyer".to_string(),
        }
    }
}

#[derive(InputObject)]
#[graphql(name = "EntryGroupFetchOptions")]
pub(super) struct EntryGroupFetchOptions {
    #[graphql(flatten)]
    options: FetchOptions<EntryGroupFields>,
    grouping: EntryGroupOptions,
}

#[derive(SimpleObject)]
pub(super) struct EntryGroup {
    pub(super) id: i32,
    pub(super) name: String,
}

#[derive(Enum, Clone, Copy, PartialEq, Eq)]
pub(super) enum EntryGroupFields {
    Name,
}

impl FieldsToSql for EntryGroupFields {}

impl ToString for EntryGroupFields {
    fn to_string(&self) -> String {
        match self {
            EntryGroupFields::Name => "name".to_string(),
        }
    }
}

#[derive(Enum, Clone, Copy, PartialEq, Eq)]
pub(super) enum EntryFetchIdOptionsEnum {
    EntryId,
    CellId,
    CultureId,
}

#[derive(InputObject)]
pub(super) struct EntryFetchId {
    id: i32,
    id_type: EntryFetchIdOptionsEnum,
}

#[derive(InputObject)]
pub(super) struct EntryFetchIdOptions {
    id: Option<EntryFetchId>,
}

impl QueryBuilderHelpers<'_, Postgres> for Entry {}

#[async_trait]
impl DatabaseQueries<Postgres> for Entry {
    type IO = EntryInsertOptions;

    type FO = EntryFetchOptions;

    type UO = EntryUpdateOptions;

    type DO = DeleteOptions;

    type GetManyResult = Entries;

    async fn insert(
        executor: &mut Transaction<'_, Postgres>,
        options: &EntryInsertOptions,
    ) -> Result<Self> {
        let ccp_d_group = options.d_group.unwrap_or(1);
        let partial_entry = sqlx::query!(
            "
            INSERT INTO entry (date, weight, weight_type, id_buyer, id_cell, id_culture, d_group, ccp_d_group)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id
            ",
            options.date,
            options.weight,
            options.weight_type,
            options.id_buyer,
            options.cell_culture_pair.id_cell,
            options.cell_culture_pair.id_culture,
            options.d_group,
            ccp_d_group,
        )
        .fetch_one(&mut *executor)
        .await?;

        Ok(Self::get(
            &mut *executor,
            &EntryFetchOptions {
                id: EntryFetchIdOptions {
                    id: Some(EntryFetchId {
                        id: partial_entry.id,
                        id_type: EntryFetchIdOptionsEnum::EntryId,
                    }),
                },
                data_group_id: options.d_group,
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
        let mut builder = sqlx::QueryBuilder::new("SELECT *, COUNT(*) OVER() as total_count FROM ");
        Self::filter_and_order_with_score(
            "entry",
            options,
            "e_id",
            &mut builder,
            Some(
                "
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
                entry.d_group
                ",
            ),
            Some(
                "
                INNER JOIN buyer ON buyer.id = entry.id_buyer
                INNER JOIN cell ON cell.id = entry.id_cell
                INNER JOIN culture ON culture.id = entry.id_culture
                INNER JOIN cell_culture_pair ON
                    cell_culture_pair.id_cell = entry.id_cell AND
                    cell_culture_pair.id_culture = entry.id_culture
                ",
            ),
            Some(|separator: &mut Separated<_, &str>| {
                // if let Some(id) = options.data_group_id {
                //     separator.push("entry.d_group = ").push_bind_unseparated(id);
                // } else {
                //     separator.push("entry.d_group = 1 ");
                // }

                match &options.id.id {
                    Some(i) => match i.id_type {
                        EntryFetchIdOptionsEnum::CellId => {
                            separator
                                .push("entry.e_id_cell = ")
                                .push_bind_unseparated(i.id);
                        }
                        EntryFetchIdOptionsEnum::CultureId => {
                            separator
                                .push("entry.e_id_culture = ")
                                .push_bind_unseparated(i.id);
                        }
                        EntryFetchIdOptionsEnum::EntryId => {
                            separator.push("entry.e_id = ").push_bind_unseparated(i.id);
                        }
                    },
                    None => {}
                };
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
                    d_group: d_group.clone(),
                }),
                cell_culture_pair: Some(CellCulturePair {
                    created_at: e.try_get("ccp_created_at")?,
                    cell: Some(Cell {
                        id: e.try_get("c_id")?,
                        name: e.try_get("c_name")?,
                        description: e.try_get("c_desc")?,
                        created_at: e.try_get("c_created_at")?,
                        d_group: d_group.clone(),
                    }),
                    culture: Some(Culture {
                        id: e.try_get("cu_id")?,
                        name: e.try_get("cu_name")?,
                        description: e.try_get("cu_desc")?,
                        created_at: e.try_get("cu_created_at")?,
                        d_group: d_group.clone(),
                    }),
                    d_group: d_group.clone(),
                }),
                d_group: d_group.clone(),
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
        let id_options = match &options.id.id {
            Some(i) => match i.id_type {
                EntryFetchIdOptionsEnum::CellId
                | EntryFetchIdOptionsEnum::CultureId
                | EntryFetchIdOptionsEnum::EntryId => OptionalId { id: Some(i.id) },
            },
            None => OptionalId { id: None },
        };

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
                entry.d_group as e_d_group,
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
                entry.d_group
            FROM entry
            INNER JOIN buyer ON buyer.id = entry.id_buyer
            INNER JOIN cell ON cell.id = entry.id_cell
            INNER JOIN culture ON culture.id = entry.id_culture
            INNER JOIN cell_culture_pair ON 
                cell_culture_pair.id_cell = entry.id_cell AND 
                cell_culture_pair.id_culture = entry.id_culture
            WHERE entry.id = $1
            ",
            id_options.id,
        )
        .fetch_one(&mut *executor)
        .await?;

        let d_group = Some(Arc::new(
            DataGroup::get(&mut *executor, r.e_d_group.unwrap_or(1)).await?,
        ));

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
                d_group: d_group.clone(),
            }),
            cell_culture_pair: Some(CellCulturePair {
                created_at: r.ccp_created_at,
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
                d_group: d_group.clone(),
            }),
            d_group,
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
                id: EntryFetchIdOptions {
                    id: Some(EntryFetchId {
                        id: Some(r.try_get("id")?).unwrap_or(0),
                        id_type: EntryFetchIdOptionsEnum::EntryId,
                    }),
                },
                data_group_id: options.d_group,
                page: None,
                limit: None,
                filters: None,
                ordering: None,
            },
        )
        .await?)
    }

    async fn delete(
        executor: &mut Transaction<'_, Postgres>,
        options: &DeleteOptions,
    ) -> Result<Self> {
        let mut builder: sqlx::QueryBuilder<Postgres> =
            sqlx::QueryBuilder::new("DELETE FROM entry ");
        builder.push("WHERE id = ").push_bind(options.id).push(
            "RETURNING id, id_cell, id_culture, id_buyer, weight, weight_type, created_at, date, d_group",
        );

        let query = builder.build();
        let row = query.fetch_one(&mut *executor).await?;

        let id_buyer: i32 = row.try_get("id_buyer")?;
        let id_cell: i32 = row.try_get("id_cell")?;
        let id_culture: i32 = row.try_get("id_culture")?;
        let id_data_group: Option<i32> = row.try_get("d_group")?;

        // WARN: Might fail if entry has no defined data_group
        let r = sqlx::query!(
            "
        SELECT 
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
            data_group.id as d_g_id,
            data_group.name as d_g_name,
            data_group.description as d_g_description,
            data_group.created_at as d_g_created_at
        FROM buyer, cell, culture, cell_culture_pair, data_group
        WHERE 
            buyer.id = $1 AND
            cell.id = $2 AND
            culture.id = $3 AND
            cell_culture_pair.id_cell = $2 AND cell_culture_pair.id_culture = $3 AND
            data_group.id = $4
        ",
            id_buyer,
            id_cell,
            id_culture,
            id_data_group,
        )
        .fetch_one(&mut *executor)
        .await?;

        let d_group = Some(Arc::new(DataGroup {
            id: r.d_g_id,
            name: r.d_g_name,
            created_at: r.d_g_created_at,
            description: r.d_g_description,
        }));

        Ok(Self {
            id: row.try_get("id")?,
            weight: row.try_get("weight")?,
            weight_type: row.try_get("weight_type")?,
            date: row.try_get("date")?,
            created_at: row.try_get("created_at")?,
            buyer: Some(Buyer {
                id: r.b_id,
                name: r.b_name,
                address: r.b_address,
                contact: r.b_contact,
                created_at: r.b_created_at,
                d_group: d_group.clone(),
            }),
            cell_culture_pair: Some(CellCulturePair {
                created_at: r.ccp_created_at,
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
                d_group: d_group.clone(),
            }),
            d_group,
        })
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

        let res = Entry::get_many(&mut transaction, &fetch_options).await?;

        transaction.commit().await?;
        Ok(res)
    }

    async fn entry(&self, ctx: &Context<'_>, fetch_options: EntryFetchOptions) -> Result<Entry> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let res = Entry::get(&mut transaction, &fetch_options).await?;

        transaction.commit().await?;
        Ok(res)
    }

    async fn get_entry_groups(
        &self,
        ctx: &Context<'_>,
        fetch_options: EntryGroupFetchOptions,
    ) -> Result<EntryGroups> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let grouping = fetch_options.grouping.to_sql();
        let grouping_descriptor = fetch_options.grouping.to_string();
        let mut builder = sqlx::QueryBuilder::new("SELECT COUNT(*) OVER() as total_count, ");
        builder.push(&grouping).push("FROM entry ").push(format!(
            "INNER JOIN {0} ON {0}.id = id_{0} ",
            grouping_descriptor
        ));
        Entry::filter(&fetch_options.options.filters, &mut builder, true);
        builder.push("GROUP BY ").push(grouping);
        Entry::order_by(&fetch_options.options.ordering, "name", &mut builder);
        Entry::paginate(
            fetch_options.options.limit,
            fetch_options.options.page,
            &mut builder,
        );
        let rows = builder.build().fetch_all(&mut transaction).await?;

        let total = match rows.first() {
            Some(t) => t.try_get("total_count")?,
            None => 0,
        };

        let mut groups = Vec::with_capacity(rows.len());
        let id_descriptor = format!("id_{}", grouping_descriptor);
        for g in rows.into_iter() {
            groups.push(EntryGroup {
                id: g.try_get(id_descriptor.as_str())?,
                name: g.try_get("name")?,
            });
        }

        let res = EntryGroups {
            results: groups,
            pagination: Pagination {
                limit: fetch_options.options.limit.unwrap_or_default(),
                page: fetch_options.options.page.unwrap_or_default(),
                total,
            },
        };

        transaction.commit().await?;
        Ok(res)
    }

    async fn get_all_entries(
        &self,
        ctx: &Context<'_>,
        fetch_options: EntryFetchOptions,
    ) -> Result<Entries> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let mut builder = sqlx::QueryBuilder::new("SELECT *, COUNT(*) OVER() as total_count FROM ");
        Entry::filter_and_order_with_score(
            "entry",
            &fetch_options,
            "e_id",
            &mut builder,
            Some(
                "
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
                entry.d_group
                ",
            ),
            Some(
                "
                INNER JOIN buyer ON buyer.id = entry.id_buyer
                INNER JOIN cell ON cell.id = entry.id_cell
                INNER JOIN culture ON culture.id = entry.id_culture
                INNER JOIN cell_culture_pair ON
                    cell_culture_pair.id_cell = entry.id_cell AND
                    cell_culture_pair.id_culture = entry.id_culture
                ",
            ),
            Some(|separator: &mut Separated<_, &str>| {
                // if let Some(id) = fetch_options.data_group_id {
                //     separator.push("entry.d_group = ").push_bind_unseparated(id);
                // } else {
                //     separator.push("entry.d_group = 1 ");
                // }

                match &fetch_options.id.id {
                    Some(i) => match i.id_type {
                        EntryFetchIdOptionsEnum::CellId => {
                            separator
                                .push("entry.e_id_cell = ")
                                .push_bind_unseparated(i.id);
                        }
                        EntryFetchIdOptionsEnum::CultureId => {
                            separator
                                .push("entry.e_id_culture = ")
                                .push_bind_unseparated(i.id);
                        }
                        EntryFetchIdOptionsEnum::EntryId => {
                            separator.push("entry.e_id = ").push_bind_unseparated(i.id);
                        }
                    },
                    None => {}
                };
            }),
        );
        let rows = builder.build().fetch_all(&mut transaction).await?;

        let total = match rows.first() {
            Some(t) => t.try_get("total_count")?,
            None => 0,
        };

        let d_group = if let Some(id) = fetch_options.data_group_id {
            Some(Arc::new(DataGroup::get(&mut transaction, id).await?))
        } else {
            None
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
                    d_group: d_group.clone(),
                }),
                cell_culture_pair: Some(CellCulturePair {
                    created_at: e.try_get("ccp_created_at")?,
                    cell: Some(Cell {
                        id: e.try_get("c_id")?,
                        name: e.try_get("c_name")?,
                        description: e.try_get("c_desc")?,
                        created_at: e.try_get("c_created_at")?,
                        d_group: d_group.clone(),
                    }),
                    culture: Some(Culture {
                        id: e.try_get("cu_id")?,
                        name: e.try_get("cu_name")?,
                        description: e.try_get("cu_desc")?,
                        created_at: e.try_get("cu_created_at")?,
                        d_group: d_group.clone(),
                    }),
                    d_group: d_group.clone(),
                }),
                d_group: d_group.clone(),
            })
        }

        let res = Ok(Entries {
            pagination: Pagination {
                limit: fetch_options.limit.unwrap_or_default(),
                page: fetch_options.page.unwrap_or_default(),
                total,
            },
            results: entries,
        });

        transaction.commit().await?;

        res
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

        let res = Entry::insert(&mut transaction, &insert_options).await?;

        transaction.commit().await?;

        Ok(res)
    }

    async fn update_entry(
        &self,
        ctx: &Context<'_>,
        update_options: EntryUpdateOptions,
    ) -> Result<Entry> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let res = Entry::update(&mut transaction, &update_options).await?;

        transaction.commit().await?;
        Ok(res)
    }

    async fn delete_entry(
        &self,
        ctx: &Context<'_>,
        delete_options: DeleteOptions,
    ) -> Result<Entry> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let res = Entry::delete(&mut transaction, &delete_options).await?;

        transaction.commit().await?;
        Ok(res)
    }
}
