use anyhow::Result;
use chrono::{DateTime, Utc};
use sqlx::{Database, Postgres, Transaction};

struct Buyer {
    id: i32,
    name: Option<String>,
    address: Option<String>,
    contact: Option<String>,
    date: DateTime<Utc>,
    // note: Option<String>,
}

impl Buyer {
    async fn insert_new(
        transaction: &mut Transaction<'_, Postgres>,
        name: Option<&String>,
        address: Option<&String>,
        contact: Option<&String>,
        date: Option<&DateTime<Utc>>,
        note: Option<&String>,
    ) -> Result<Self> {
        Ok(sqlx::query_as!(
            Self,
            "
            INSERT INTO buyer (name, address, contact, date)
            VALUES ($1, $2, $3, $4)
            RETURNING *
            ",
            name,
            address,
            contact,
            date
        )
        .fetch_one(transaction)
        .await?)
    }
}
