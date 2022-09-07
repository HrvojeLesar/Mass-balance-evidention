use anyhow::Result;
use chrono::{DateTime, Utc};
use sqlx::{Postgres, Transaction};

struct Entry {
    id: i32,
    weight: Option<f64>,
    weight_type: Option<String>,
    date: DateTime<Utc>,
    id_buyer: Option<i32>,
    id_cell: Option<i32>,
    id_culture: Option<i32>,
}

impl Entry {
    async fn insert_new(
        transaction: &mut Transaction<'_, Postgres>,
        weight: f64,
        weight_type: String,
        date: Option<&DateTime<Utc>>,
        id_buyer: i32,
        id_cell: i32,
        id_culture: i32,
    ) -> Result<Self> {
        Ok(sqlx::query_as!(
            Self,
            "
            INSERT INTO entry (weight, weight_type, date, id_buyer, id_cell, id_culture)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
            ",
            weight,
            weight_type,
            date,
            id_buyer,
            id_cell,
            id_culture,
        )
        .fetch_one(transaction)
        .await?)
    }
}
