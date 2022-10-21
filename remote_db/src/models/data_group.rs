use anyhow::Result;
use async_graphql::{Context, InputObject, Object, SimpleObject};
use chrono::{DateTime, Utc};
use sqlx::{FromRow, Postgres, Transaction};

use crate::DatabasePool;

use super::DeleteOptions;

#[derive(SimpleObject, FromRow, Debug)]
pub(super) struct DataGroup {
    pub(super) id: i32,
    pub(super) name: String,
    pub(super) description: Option<String>,
    pub(super) created_at: DateTime<Utc>,
}

#[derive(InputObject)]
pub(super) struct DataGroupInsertOptions {
    pub(super) name: String,
    pub(super) description: Option<String>,
}

impl DataGroup {
    pub async fn get(
        executor: &mut Transaction<'_, Postgres>,
        id: i32, // options: &DataGroupFetchOptions
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

#[derive(Default)]
pub struct DataGroupQuery;

#[Object]
impl DataGroupQuery {
    async fn data_groups(&self, ctx: &Context<'_>) -> Result<Vec<DataGroup>> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let data_groups = sqlx::query_as!(DataGroup, "SELECT * FROM data_group")
            .fetch_all(&mut transaction)
            .await?;

        transaction.commit().await?;
        Ok(data_groups)
    }
}

#[derive(Default)]
pub struct DataGroupMutation;

#[Object]
impl DataGroupMutation {
    async fn insert_data_group(
        &self,
        ctx: &Context<'_>,
        insert_options: DataGroupInsertOptions,
    ) -> Result<DataGroup> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let data_group = sqlx::query_as!(
            DataGroup,
            "
            INSERT INTO data_group (name, description) 
            VALUES ($1, $2)
            RETURNING *
            ",
            insert_options.name,
            insert_options.description
        )
        .fetch_one(&mut transaction)
        .await?;

        transaction.commit().await?;
        Ok(data_group)
    }

    async fn delete_data_group(
        &self,
        ctx: &Context<'_>,
        delete_options: DeleteOptions,
    ) -> Result<DataGroup> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let data_group = sqlx::query_as!(
            DataGroup,
            "
            DELETE FROM data_group
            WHERE id = $1
            RETURNING *
            ",
            delete_options.id
        )
        .fetch_one(&mut transaction)
        .await?;

        transaction.commit().await?;
        Ok(data_group)
    }
}
