use anyhow::Result;
use chrono::{DateTime, Utc};
use sqlx::{Database, Postgres, Transaction};

struct Cell {
    id: i32,
    name: String,
    description: Option<String>,
    created_at: DateTime<Utc>,
}

impl Cell {
    async fn insert_new(
        transaction: &mut Transaction<'_, Postgres>,
        name: &String,
        description: Option<&String>,
        created_at: Option<&DateTime<Utc>>,
    ) -> Result<Self> {
        Ok(sqlx::query_as!(
            Self,
            "
            INSERT INTO cell (name, description, created_at)
            VALUES ($1, $2, $3)
            RETURNING *
            ",
            name,
            description,
            created_at
        )
        .fetch_one(transaction)
        .await?)
    }
}
