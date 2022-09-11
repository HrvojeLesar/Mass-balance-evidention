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
pub(super) struct Buyer {
    pub(super) id: i32,
    pub(super) name: Option<String>,
    pub(super) address: Option<String>,
    pub(super) contact: Option<String>,
    pub(super) created_at: DateTime<Utc>,
    // note: Option<String>,
}

#[derive(InputObject)]
pub(super) struct BuyerInsertOptions {
    pub(super) name: String,
    pub(super) address: Option<String>,
    pub(super) contact: Option<String>,
}

#[derive(InputObject)]
pub(super) struct BuyerFetchOptions {
    pub(super) id: Option<i32>,
    pub(super) limit: Option<i64>,
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
    ) -> Result<Vec<Self>> {
        let limit = options.limit.unwrap_or(DEFAULT_LIMIT);
        Ok(sqlx::query_as!(
            Self,
            "
            SELECT * FROM buyer
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
    async fn buyers(
        &self,
        ctx: &Context<'_>,
        fetch_options: BuyerFetchOptions,
    ) -> Result<Vec<Buyer>> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let buyer = Buyer::get_many(&mut transaction, &fetch_options).await?;

        transaction.commit().await?;
        Ok(buyer)
    }

    async fn buyer(
        &self,
        ctx: &Context<'_>,
        fetch_options: BuyerFetchOptions,
    ) -> Result<Buyer> {
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
