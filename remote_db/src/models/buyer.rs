use anyhow::Result;
use chrono::{DateTime, Utc};
use sqlx::{Postgres, Transaction};

struct Buyer {
    id: i32,
    name: Option<String>,
    address: Option<String>,
    contact: Option<String>,
    created_at: DateTime<Utc>,
    // note: Option<String>,
}

impl Buyer {
    async fn insert_new(
        transaction: &mut Transaction<'_, Postgres>,
        name: Option<&String>,
        address: Option<&String>,
        contact: Option<&String>,
        created_at: Option<&DateTime<Utc>>,
        _note: Option<&String>,
    ) -> Result<Self> {
        Ok(sqlx::query_as!(
            Self,
            "
            INSERT INTO buyer (name, address, contact, created_at)
            VALUES ($1, $2, $3, $4)
            RETURNING *
            ",
            name,
            address,
            contact,
            created_at
        )
        .fetch_one(transaction)
        .await?)
    }
}
