use anyhow::Result;
use async_graphql::{Context, Enum, InputObject, Object, SimpleObject};
use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::{Encode, FromRow, Postgres, Row, Transaction};

use crate::{
    models::{DEFAULT_LIMIT, MAX_LIMIT},
    DatabasePool,
};

use super::{calc_limit, calc_offset, db_query::DatabaseQueries, Pagination, Ordering};

#[derive(Enum, Clone, Copy, PartialEq, Eq)]
pub(super) enum BuyerOrderBy {
    Name,
    Address,
    Contact,
}

impl Into<String> for BuyerOrderBy {
    fn into(self) -> String {
        match self {
            BuyerOrderBy::Name => "name".to_string(),
            BuyerOrderBy::Address => "address".to_string(),
            BuyerOrderBy::Contact => "contact".to_string(),
        }
    }
}

#[derive(SimpleObject, FromRow, Debug)]
pub(super) struct Buyer {
    pub(super) id: i32,
    pub(super) name: Option<String>,
    pub(super) address: Option<String>,
    pub(super) contact: Option<String>,
    pub(super) created_at: DateTime<Utc>,
    // note: Option<String>,
}

#[derive(SimpleObject, FromRow, Debug)]
pub(super) struct Buyers {
    #[graphql(flatten)]
    pub(super) pagination: Pagination,
    pub(super) buyers: Vec<Buyer>,
}

#[derive(InputObject)]
pub(super) struct BuyerInsertOptions {
    pub(super) name: String,
    pub(super) address: Option<String>,
    pub(super) contact: Option<String>,
}

#[derive(InputObject)]
pub(super) struct OrderingOptions {
    order: Ordering,
    order_by: BuyerOrderBy,
}

#[derive(InputObject)]
pub(super) struct BuyerFetchOptions {
    pub(super) id: Option<i32>,
    pub(super) limit: Option<i64>,
    pub(super) page: Option<i64>,
    pub(super) ordering: Option<OrderingOptions>,
}

#[derive(InputObject)]
pub(super) struct BuyerUpdateOptions {
    pub(super) id: i32,
    pub(super) name: Option<String>,
    pub(super) address: Option<String>,
    pub(super) contact: Option<String>,
}

#[async_trait]
impl DatabaseQueries<Postgres> for Buyer {
    type IO = BuyerInsertOptions;

    type FO = BuyerFetchOptions;

    type UO = BuyerUpdateOptions;

    type GetManyResult = Buyers;

    async fn insert(
        executor: &mut Transaction<'_, Postgres>,
        options: &BuyerInsertOptions,
    ) -> Result<Self> {
        Ok(sqlx::query_as!(
            Self,
            "
            INSERT INTO buyer (name, address, contact)
            VALUES ($1, $2, $3)
            RETURNING *
            ",
            options.name,
            options.address,
            options.contact,
        )
        .fetch_one(executor)
        .await?)
    }

    async fn get_many(
        executor: &mut Transaction<'_, Postgres>,
        options: &BuyerFetchOptions,
    ) -> Result<Buyers> {
        let mut builder: sqlx::QueryBuilder<Postgres> =
            sqlx::QueryBuilder::new("SELECT *, COUNT(*) OVER() as total_count FROM buyer ");
        match &options.ordering {
            Some(ord) => {
                builder.push("ORDER BY ").push(
                    format!("{} {} ",
                    Into::<String>::into(ord.order_by),
                    Into::<String>::into(ord.order),
                ));
            }
            None => {
                builder.push("ORDER BY id ASC ");
            }
        }
        builder
            .push("LIMIT ")
            .push_bind(calc_limit(options.limit))
            .push("OFFSET ")
            .push_bind(calc_offset(options.page, options.limit));

        let r = builder.build().fetch_all(executor).await?;

        let total = match r.first() {
            Some(b) => b.try_get("total_count")?,
            None => 0,
        };

        let mut buyers = Vec::with_capacity(r.len());
        for b in r.into_iter() {
            buyers.push(Buyer {
                id: b.try_get("id")?,
                name: b.try_get("name")?,
                address: b.try_get("address")?,
                contact: b.try_get("contact")?,
                created_at: b.try_get("created_at")?,
            });
        }

        Ok(Buyers {
            pagination: Pagination {
                limit: options.limit.unwrap_or_default(),
                page: options.page.unwrap_or_default(),
                total,
            },
            buyers,
        })
    }

    async fn get(
        executor: &mut Transaction<'_, Postgres>,
        options: &BuyerFetchOptions,
    ) -> Result<Self> {
        Ok(sqlx::query_as!(
            Self,
            "
            SELECT * FROM buyer
            WHERE id = $1
            ",
            options.id
        )
        .fetch_one(executor)
        .await?)
    }

    async fn update(
        executor: &mut Transaction<'_, Postgres>,
        options: &BuyerUpdateOptions,
    ) -> Result<Self> {
        let mut builder: sqlx::QueryBuilder<Postgres> =
            sqlx::QueryBuilder::new("UPDATE buyer SET ");
        let mut sep = builder.separated(", ");
        if let Some(name) = &options.name {
            sep.push("name = ").push_bind_unseparated(name);
        }
        if let Some(address) = &options.address {
            sep.push("address = ").push_bind_unseparated(address);
        }
        if let Some(contact) = &options.contact {
            sep.push("contact = ").push_bind_unseparated(contact);
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
pub struct BuyerQuery;

#[Object]
impl BuyerQuery {
    async fn buyers(&self, ctx: &Context<'_>, fetch_options: BuyerFetchOptions) -> Result<Buyers> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let buyer = Buyer::get_many(&mut transaction, &fetch_options).await?;

        transaction.commit().await?;
        Ok(buyer)
    }

    async fn buyer(&self, ctx: &Context<'_>, fetch_options: BuyerFetchOptions) -> Result<Buyer> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let buyer = Buyer::get(&mut transaction, &fetch_options).await?;

        transaction.commit().await?;
        Ok(buyer)
    }
}

#[derive(Default)]
pub struct BuyerMutation;

#[Object]
impl BuyerMutation {
    async fn insert_buyer(
        &self,
        ctx: &Context<'_>,
        insert_options: BuyerInsertOptions,
    ) -> Result<Buyer> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let buyer = Buyer::insert(&mut transaction, &insert_options).await?;

        transaction.commit().await?;
        Ok(buyer)
    }

    async fn update_buyer(
        &self,
        ctx: &Context<'_>,
        update_options: BuyerUpdateOptions,
    ) -> Result<Buyer> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let buyer = Buyer::update(&mut transaction, &update_options).await?;

        transaction.commit().await?;
        Ok(buyer)
    }
}
