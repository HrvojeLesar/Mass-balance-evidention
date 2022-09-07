use anyhow::Result;
use chrono::{DateTime, Utc};
use sqlx::{Database, Postgres, Transaction};

struct CellCulturePair {
    id_cell: i32,
    id_culture: i32,
    date: DateTime<Utc>,
}

impl CellCulturePair {
    async fn insert_new(
        transaction: &mut Transaction<'_, Postgres>,
        id_cell: &i32,
        id_culture: &i32,
        date: Option<&DateTime<Utc>>,
    ) -> Result<Self> {
        Ok(sqlx::query_as!(
            Self,
            "
            INSERT INTO cell_culture_pair (id_cell, id_culture, date)
            VALUES ($1, $2, $3)
            RETURNING *
            ",
            id_cell,
            id_culture,
            date
        )
        .fetch_one(transaction)
        .await?)
    }
}
