use std::sync::Arc;

use actix_web::web::Data;
use anyhow::Result;
use async_graphql::{Context, Enum, InputObject, Object, SimpleObject};
use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sea_orm::{EntityTrait, PaginatorTrait, TransactionTrait};
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, Postgres, Row, Transaction};

use crate::{seaorm_models::{buyer, QueryDatabase}, DatabasePool, SeaOrmPool};

use super::{
    data_group::DataGroup,
    db_query::{calc_limit, DatabaseQueries, QueryBuilderHelpers},
    DeleteOptions, FetchMany, FetchOptions, FieldsToSql, Pagination,
};

type BuyerFetchOptions = FetchOptions<BuyerFields>;
type Buyers = FetchMany<Buyer>;

pub type BuyerNew = buyer::Model;
pub type BuyersNew = FetchMany<buyer::Model>;

#[derive(SimpleObject, FromRow, Debug)]
pub(super) struct Buyer {
    pub(super) id: i32,
    pub(super) name: Option<String>,
    pub(super) address: Option<String>,
    pub(super) contact: Option<String>,
    pub(super) created_at: DateTime<Utc>,
    pub(super) d_group: Option<Arc<DataGroup>>,
    // note: Option<String>,
}

#[derive(Enum, Clone, Copy, PartialEq, Eq)]
pub enum BuyerFields {
    Name,
    Address,
    Contact,
}

impl FieldsToSql for BuyerFields {}

impl ToString for BuyerFields {
    fn to_string(&self) -> String {
        match self {
            Self::Name => "name".to_string(),
            Self::Address => "address".to_string(),
            Self::Contact => "contact".to_string(),
        }
    }
}

#[derive(InputObject, Serialize, Deserialize)]
pub struct BuyerInsertOptions {
    pub name: String,
    pub address: Option<String>,
    pub contact: Option<String>,
    pub d_group: Option<i32>,
}

#[derive(InputObject)]
pub struct BuyerUpdateOptions {
    pub id: i32,
    pub name: Option<String>,
    pub address: Option<String>,
    pub contact: Option<String>,
}

impl QueryBuilderHelpers<'_, Postgres> for Buyer {}

#[async_trait]
impl DatabaseQueries<Postgres> for Buyer {
    type IO = BuyerInsertOptions;

    type FO = BuyerFetchOptions;

    type UO = BuyerUpdateOptions;

    type DO = DeleteOptions;

    type GetManyResult = Buyers;

    async fn insert(
        executor: &mut Transaction<'_, Postgres>,
        options: &BuyerInsertOptions,
    ) -> Result<Self> {
        let rec = sqlx::query!(
            "
            INSERT INTO buyer (name, address, contact, d_group)
            VALUES ($1, $2, $3, $4)
            RETURNING *
            ",
            options.name,
            options.address,
            options.contact,
            options.d_group
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
            address: rec.address,
            contact: rec.contact,
            created_at: rec.created_at,
            d_group,
        })
    }

    async fn get_many(
        executor: &mut Transaction<'_, Postgres>,
        options: &BuyerFetchOptions,
    ) -> Result<Buyers> {
        let mut builder = sqlx::QueryBuilder::new("SELECT *, COUNT(*) OVER() as total_count FROM ");
        Self::handle_fetch_options_with_score(options, "buyer", "id", &mut builder);
        let r = builder.build().fetch_all(&mut *executor).await?;

        let total = match r.first() {
            Some(b) => b.try_get("total_count")?,
            None => 0,
        };

        let d_group = if let Some(id) = options.data_group_id {
            Some(Arc::new(DataGroup::get(&mut *executor, id).await?))
        } else {
            None
        };

        let mut buyers = Vec::with_capacity(r.len());
        for b in r.into_iter() {
            buyers.push(Buyer {
                id: b.try_get("id")?,
                name: b.try_get("name")?,
                address: b.try_get("address")?,
                contact: b.try_get("contact")?,
                created_at: b.try_get("created_at")?,
                d_group: d_group.clone(),
            });
        }

        Ok(Buyers {
            pagination: Pagination {
                page_size: options.page_size.unwrap_or_default(),
                page: options.page.unwrap_or_default(),
                total,
            },
            results: buyers,
        })
    }

    async fn get(
        executor: &mut Transaction<'_, Postgres>,
        options: &BuyerFetchOptions,
    ) -> Result<Self> {
        let rec = sqlx::query!(
            "
            SELECT * FROM buyer
            WHERE id = $1
            ",
            options.id.id
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
            address: rec.address,
            contact: rec.contact,
            created_at: rec.created_at,
            d_group,
        })
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
            address: rec.try_get("address")?,
            contact: rec.try_get("contact")?,
            created_at: rec.try_get("created_at")?,
            d_group,
        })
    }

    async fn delete(
        executor: &mut Transaction<'_, Postgres>,
        options: &DeleteOptions,
    ) -> Result<Self> {
        let mut builder: sqlx::QueryBuilder<Postgres> =
            sqlx::QueryBuilder::new("DELETE FROM buyer ");
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
            address: rec.try_get("address")?,
            contact: rec.try_get("contact")?,
            created_at: rec.try_get("created_at")?,
            d_group,
        })
    }
}

#[derive(Default)]
pub struct BuyerQuery;

#[Object]
impl BuyerQuery {
    async fn buyers(&self, ctx: &Context<'_>, fetch_options: BuyerFetchOptions) -> Result<Buyers> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let res = Buyer::get_many(&mut transaction, &fetch_options).await?;

        transaction.commit().await?;
        Ok(res)
    }

    async fn buyer(&self, ctx: &Context<'_>, fetch_options: BuyerFetchOptions) -> Result<Buyer> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let res = Buyer::get(&mut transaction, &fetch_options).await?;

        transaction.commit().await?;
        Ok(res)
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

        let res = Buyer::insert(&mut transaction, &insert_options).await?;

        transaction.commit().await?;
        Ok(res)
    }

    async fn update_buyer(
        &self,
        ctx: &Context<'_>,
        update_options: BuyerUpdateOptions,
    ) -> Result<Buyer> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let res = Buyer::update(&mut transaction, &update_options).await?;

        transaction.commit().await?;
        Ok(res)
    }

    async fn delete_buyer(
        &self,
        ctx: &Context<'_>,
        delete_options: DeleteOptions,
    ) -> Result<Buyer> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let res = Buyer::delete(&mut transaction, &delete_options).await?;

        transaction.commit().await?;
        Ok(res)
    }
}

#[derive(Default)]
pub struct NewBuyerQuery;

#[Object]
impl NewBuyerQuery {
    async fn buyers_new(
        &self,
        ctx: &Context<'_>,
        fetch_options: BuyerFetchOptions,
    ) -> Result<BuyersNew> {
        let pool = ctx.data::<SeaOrmPool>().expect("Pool must exist");
        todo!()
        // crate::seaorm_models::entry::Entity::fetch(&pool, fetch_options);
        // buyer::Model::get(pool, fetch_options).await
    }

    async fn buyer(&self, ctx: &Context<'_>, fetch_options: BuyerFetchOptions) -> Result<Buyer> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let res = Buyer::get(&mut transaction, &fetch_options).await?;

        transaction.commit().await?;
        Ok(res)
    }
}
