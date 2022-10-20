use anyhow::Result;
use async_graphql::SimpleObject;
use chrono::{DateTime, Utc};
use sqlx::{FromRow, Postgres, Transaction};

#[derive(SimpleObject, FromRow, Debug)]
pub(super) struct DataGroup {
    pub(super) id: i32,
    pub(super) name: String,
    pub(super) description: Option<String>,
    pub(super) created_at: DateTime<Utc>,
}

impl DataGroup {
    pub async fn get(
        executor: &mut Transaction<'_, Postgres>,
        id: i32
        // options: &DataGroupFetchOptions
    ) -> Result<Self> {
        Ok(sqlx::query_as!(
            Self,
            "
            SELECT * FROM data_group
            WHERE id = $1
            ",
            id
        )
        .fetch_one(executor)
        .await?)
    }
}
