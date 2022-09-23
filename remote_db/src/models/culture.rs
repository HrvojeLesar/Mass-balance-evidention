use anyhow::Result;
use async_graphql::{Context, Enum, InputObject, Object, SimpleObject};
use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::{FromRow, Postgres, Row, Transaction};

use crate::DatabasePool;

use super::{
    db_query::{DatabaseQueries, QueryBuilderHelpers},
    FetchMany, FetchOptions, FieldsToSql, Pagination,
};

type CultureFetchOptions = FetchOptions<CultureFields>;
type Cultures = FetchMany<Culture>;
type CultureFetchUnpairedOptions = FetchOptions<CultureFields, CultureUnpairedId>;

#[derive(InputObject)]
pub struct CultureUnpairedId {
    /// Id refers to a Cell Id
    pub id: Option<i32>,
}

#[derive(SimpleObject, FromRow, Debug)]
pub(super) struct Culture {
    pub(super) id: i32,
    pub(super) name: String,
    pub(super) description: Option<String>,
    pub(super) created_at: DateTime<Utc>,
}

#[derive(Enum, Clone, Copy, PartialEq, Eq)]
pub(super) enum CultureFields {
    Name,
    Description,
}

impl FieldsToSql for CultureFields {}

impl ToString for CultureFields {
    fn to_string(&self) -> String {
        match self {
            Self::Name => "name".to_string(),
            Self::Description => "description".to_string(),
        }
    }
}

#[derive(InputObject)]
pub(super) struct CultureInsertOptions {
    pub(super) name: String,
    pub(super) description: Option<String>,
}

#[derive(InputObject)]
pub(super) struct CultureUpdateOptions {
    pub(super) id: i32,
    pub(super) name: Option<String>,
    pub(super) description: Option<String>,
}

impl QueryBuilderHelpers<'_, Postgres> for Culture {}

#[async_trait]
impl DatabaseQueries<Postgres> for Culture {
    type IO = CultureInsertOptions;

    type FO = CultureFetchOptions;

    type UO = CultureUpdateOptions;

    type GetManyResult = Cultures;

    async fn insert(
        executor: &mut Transaction<'_, Postgres>,
        options: &CultureInsertOptions,
    ) -> Result<Self> {
        Ok(sqlx::query_as!(
            Self,
            "
            INSERT INTO culture (name, description)
            VALUES ($1, $2)
            RETURNING *
            ",
            options.name,
            options.description,
        )
        .fetch_one(executor)
        .await?)
    }

    async fn get_many(
        executor: &mut Transaction<'_, Postgres>,
        options: &CultureFetchOptions,
    ) -> Result<Cultures> {
        let mut builder =
            sqlx::QueryBuilder::new("SELECT *, COUNT(*) OVER () as total_count FROM culture ");
        Self::handle_fetch_options(options, "id", &mut builder);
        let r = builder.build().fetch_all(executor).await?;

        let total = match r.first() {
            Some(t) => t.try_get("total_count")?,
            None => 0,
        };

        let mut cultures = Vec::with_capacity(r.len());
        for c in r.into_iter() {
            cultures.push(Culture {
                id: c.try_get("id")?,
                name: c.try_get("name")?,
                description: c.try_get("description")?,
                created_at: c.try_get("created_at")?,
            });
        }

        Ok(Cultures {
            pagination: Pagination {
                limit: options.limit.unwrap_or_default(),
                page: options.page.unwrap_or_default(),
                total,
            },
            results: cultures,
        })
    }

    async fn get(
        executor: &mut Transaction<'_, Postgres>,
        options: &CultureFetchOptions,
    ) -> Result<Self> {
        Ok(sqlx::query_as!(
            Self,
            "
            SELECT * FROM culture
            WHERE id = $1
            ",
            options.id.id
        )
        .fetch_one(executor)
        .await?)
    }

    async fn update(
        executor: &mut Transaction<'_, Postgres>,
        options: &CultureUpdateOptions,
    ) -> Result<Self> {
        let mut builder: sqlx::QueryBuilder<Postgres> =
            sqlx::QueryBuilder::new("UPDATE culture SET ");
        let mut sep = builder.separated(", ");
        if let Some(name) = &options.name {
            sep.push("name = ").push_bind_unseparated(name);
        }
        if let Some(description) = &options.description {
            sep.push("description = ")
                .push_bind_unseparated(description);
        }
        builder
            .push("WHERE id = ")
            .push_bind(options.id)
            .push("RETURNING *");

        let query = builder.build_query_as();
        Ok(query.fetch_one(executor).await?)
    }
}

#[derive(Default)]
pub struct CultureQuery;

#[Object]
impl CultureQuery {
    async fn cultures(
        &self,
        ctx: &Context<'_>,
        fetch_options: CultureFetchOptions,
    ) -> Result<Cultures> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let res = Culture::get_many(&mut transaction, &fetch_options).await?;

        transaction.commit().await?;
        Ok(res)
    }

    async fn culture(
        &self,
        ctx: &Context<'_>,
        fetch_options: CultureFetchOptions,
    ) -> Result<Culture> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let res = Culture::get(&mut transaction, &fetch_options).await?;

        transaction.commit().await?;
        Ok(res)
    }

    async fn unpaired_cultures(
        &self,
        ctx: &Context<'_>,
        fetch_options: CultureFetchUnpairedOptions,
    ) -> Result<Cultures> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let mut builder = sqlx::QueryBuilder::new(
            "
            SELECT *, COUNT(*) OVER() as total_count FROM culture 
            WHERE culture.id NOT IN
            (
                SELECT id_culture FROM cell_culture_pair
                WHERE cell_culture_pair.id_cell = ",
        );
        builder.push("").push_bind(fetch_options.id.id).push(" ) ");

        if let Some(filters) = &fetch_options.filters {
            builder.push("AND ");
            let mut sep = builder.separated(" AND ");
            for filter in filters {
                sep.push(&filter.field.to_sql())
                    .push_bind_unseparated(&filter.value);
            }
        }

        Culture::order_by(&fetch_options.ordering, "name", &mut builder);
        Culture::paginate(fetch_options.limit, fetch_options.page, &mut builder);
        let r = builder.build().fetch_all(&mut transaction).await?;

        let total = match r.first() {
            Some(t) => t.try_get("total_count")?,
            None => 0,
        };

        let mut cultures = Vec::with_capacity(r.len());
        for c in r.into_iter() {
            cultures.push(Culture {
                id: c.try_get("id")?,
                name: c.try_get("name")?,
                description: c.try_get("description")?,
                created_at: c.try_get("created_at")?,
            });
        }

        transaction.commit().await?;

        Ok(Cultures {
            pagination: Pagination {
                limit: fetch_options.limit.unwrap_or_default(),
                page: fetch_options.page.unwrap_or_default(),
                total,
            },
            results: cultures,
        })
    }
}

#[derive(Default)]
pub struct CultureMutation;

#[Object]
impl CultureMutation {
    async fn insert_culture(
        &self,
        ctx: &Context<'_>,
        insert_options: CultureInsertOptions,
    ) -> Result<Culture> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let res = Culture::insert(&mut transaction, &insert_options).await?;

        transaction.commit().await?;
        Ok(res)
    }

    async fn update_culture(
        &self,
        ctx: &Context<'_>,
        update_options: CultureUpdateOptions,
    ) -> Result<Culture> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let res = Culture::update(&mut transaction, &update_options).await?;

        transaction.commit().await?;
        Ok(res)
    }
}
