use anyhow::Result;
use chrono::{DateTime, Utc};
use sqlx::{Database, Postgres, Transaction};

struct Cell {
    id: i32,
    name: String,
    description: Option<String>,
    date: DateTime<Utc>,
}

impl Cell {
    async fn insert_new(
        transaction: &mut Transaction<'_, Postgres>,
        name: &String,
        description: Option<&String>,
        date: Option<&DateTime<Utc>>,
    ) -> Result<Self> {
        Ok(sqlx::query_as!(
            Self,
            "
            INSERT INTO cell (name, description, date)
            VALUES ($1, $2, $3)
            RETURNING *
            ",
            name,
            description,
            date
        )
        .fetch_one(transaction)
        .await?)
    }
}
