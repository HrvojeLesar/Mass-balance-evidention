use anyhow::Result;
use chrono::{DateTime, Utc};
use sqlx::{Database, Postgres, Transaction};

pub struct Weight {
    id: String,
    name: Option<String>,
}

impl Weight {
    async fn insert_new(
        transaction: &mut Transaction<'_, Postgres>,
        short_name: &String,
        name: Option<&String>
    ) -> Result<Self> {
        Ok(sqlx::query_as!(
            Self,
            "
            INSERT INTO weight_types (id, name)
            VALUES ($1, $2)
            RETURNING *
            ",
            short_name,
            name,
        )
        .fetch_one(transaction)
        .await?)
    }
}
