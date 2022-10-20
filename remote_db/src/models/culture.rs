use std::sync::Arc;

use anyhow::Result;
use async_graphql::{Context, Enum, InputObject, Object, SimpleObject};
use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::{FromRow, Postgres, Row, Transaction, query_builder::Separated};

use crate::DatabasePool;

use super::{
    data_group::DataGroup,
    db_query::{DatabaseQueries, QueryBuilderHelpers},
    DeleteOptions, FetchMany, FetchOptions, FieldsToSql, OptionalId, Pagination,
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
    pub(super) d_group: Option<Arc<DataGroup>>,
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
    pub(super) d_group: Option<i32>,
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

    type DO = DeleteOptions;

    type GetManyResult = Cultures;

    async fn insert(
        executor: &mut Transaction<'_, Postgres>,
        options: &CultureInsertOptions,
    ) -> Result<Self> {
        let rec = sqlx::query!(
            "
            INSERT INTO culture (name, description, d_group)
            VALUES ($1, $2, $3)
            RETURNING *
            ",
            options.name,
            options.description,
            options.d_group
        )
        .fetch_one(&mut *executor)
        .await?;

        let d_group = if let Some(id) = options.d_group {
            Some(Arc::new(DataGroup::get(&mut *executor, id).await?))
        } else {
            None
        };

        Ok(Self {
            id: rec.id,
            name: rec.name,
            description: rec.description,
            created_at: rec.created_at,
            d_group,
        })
    }

    async fn get_many(
        executor: &mut Transaction<'_, Postgres>,
        options: &CultureFetchOptions,
    ) -> Result<Cultures> {
        let mut builder =
            sqlx::QueryBuilder::new("SELECT *, COUNT(*) OVER () as total_count FROM ");
        Self::handle_fetch_options_with_score(options, "culture", "id", &mut builder);
        let r = builder.build().fetch_all(&mut *executor).await?;

        let total = match r.first() {
            Some(t) => t.try_get("total_count")?,
            None => 0,
        };

        let d_group = if let Some(id) = options.data_group_id {
            Some(Arc::new(DataGroup::get(&mut *executor, id).await?))
        } else {
            None
        };

        let mut cultures = Vec::with_capacity(r.len());
        for c in r.into_iter() {
            cultures.push(Culture {
                id: c.try_get("id")?,
                name: c.try_get("name")?,
                description: c.try_get("description")?,
                created_at: c.try_get("created_at")?,
                d_group: d_group.clone(),
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
        let rec = sqlx::query!(
            "
            SELECT * FROM culture
            WHERE id = $1
            ",
            options.id.id
        )
        .fetch_one(&mut *executor)
        .await?;

        let d_group = if let Some(id) = rec.d_group {
            Some(Arc::new(DataGroup::get(&mut *executor, id).await?))
        } else {
            None
        };

        Ok(Self {
            id: rec.id,
            name: rec.name,
            description: rec.description,
            created_at: rec.created_at,
            d_group,
        })
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

        let query = builder.build();
        let rec = query.fetch_one(&mut *executor).await?;

        let d_group = if let Some(id) = rec.try_get("d_group")? {
            Some(Arc::new(DataGroup::get(&mut *executor, id).await?))
        } else {
            None
        };

        Ok(Self {
            id: rec.try_get("id")?,
            name: rec.try_get("name")?,
            description: rec.try_get("description")?,
            created_at: rec.try_get("created_at")?,
            d_group,
        })
    }

    async fn delete(
        executor: &mut Transaction<'_, Postgres>,
        options: &DeleteOptions,
    ) -> Result<Self> {
        let mut builder: sqlx::QueryBuilder<Postgres> =
            sqlx::QueryBuilder::new("DELETE FROM culture ");
        builder
            .push("WHERE id = ")
            .push_bind(options.id)
            .push("RETURNING *");

        let query = builder.build();
        let rec = query.fetch_one(&mut *executor).await?;

        let d_group = if let Some(id) = rec.try_get("d_group")? {
            Some(Arc::new(DataGroup::get(&mut *executor, id).await?))
        } else {
            None
        };

        Ok(Self {
            id: rec.try_get("id")?,
            name: rec.try_get("name")?,
            description: rec.try_get("description")?,
            created_at: rec.try_get("created_at")?,
            d_group,
        })
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
        let mut builder = sqlx::QueryBuilder::new("SELECT *, COUNT(*) OVER() as total_count FROM ");

        Culture::filter_and_order_with_score(
            "culture",
            &fetch_options,
            "name",
            &mut builder,
            None,
            None,
            Some(|separator: &mut Separated<_, &str>| {
                separator
                    .push(
                        "culture.id NOT IN
                            (
                                SELECT id_culture FROM cell_culture_pair
                                WHERE cell_culture_pair.id_cell = ",
                    )
                    .push_bind_unseparated(fetch_options.id.id)
                    .push_unseparated(" ) ");
            }),
        );

        Culture::paginate(fetch_options.limit, fetch_options.page, &mut builder);
        let r = builder.build().fetch_all(&mut transaction).await?;

        let total = match r.first() {
            Some(t) => t.try_get("total_count")?,
            None => 0,
        };

        let d_group = if let Some(id) = fetch_options.data_group_id {
            Some(Arc::new(DataGroup::get(&mut transaction, id).await?))
        } else {
            None
        };

        let mut cultures = Vec::with_capacity(r.len());
        for c in r.into_iter() {
            cultures.push(Culture {
                id: c.try_get("id")?,
                name: c.try_get("name")?,
                description: c.try_get("description")?,
                created_at: c.try_get("created_at")?,
                d_group: d_group.clone(),
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

    async fn paired_cultures(
        &self,
        ctx: &Context<'_>,
        fetch_options: CultureFetchUnpairedOptions,
    ) -> Result<Cultures> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let resp;
        if fetch_options.id.id.is_none() {
            let fetch_options = CultureFetchOptions {
                id: OptionalId { id: None },
                limit: fetch_options.limit,
                page: fetch_options.page,
                ordering: fetch_options.ordering,
                filters: fetch_options.filters,
                data_group_id: fetch_options.data_group_id,
            };
            resp = Culture::get_many(&mut transaction, &fetch_options).await;
        } else {
            let mut builder =
                sqlx::QueryBuilder::new("SELECT *, COUNT(*) OVER() as total_count FROM ");

            Culture::filter_and_order_with_score(
                "culture",
                &fetch_options,
                "name",
                &mut builder,
                None,
                None,
                Some(|separator: &mut Separated<_, &str>| {
                    separator
                        .push(
                            "culture.id IN
                                (
                                    SELECT id_culture FROM cell_culture_pair
                                    WHERE cell_culture_pair.id_cell = ",
                        )
                        .push_bind_unseparated(fetch_options.id.id)
                        .push_unseparated(" ) ");
                }),
            );

            Culture::paginate(fetch_options.limit, fetch_options.page, &mut builder);
            let r = builder.build().fetch_all(&mut transaction).await?;

            let total = match r.first() {
                Some(t) => t.try_get("total_count")?,
                None => 0,
            };

            let d_group = if let Some(id) = fetch_options.data_group_id {
                Some(Arc::new(DataGroup::get(&mut transaction, id).await?))
            } else {
                None
            };

            let mut cultures = Vec::with_capacity(r.len());
            for c in r.into_iter() {
                cultures.push(Culture {
                    id: c.try_get("id")?,
                    name: c.try_get("name")?,
                    description: c.try_get("description")?,
                    created_at: c.try_get("created_at")?,
                    d_group: d_group.clone(),
                });
            }
            resp = Ok(Cultures {
                pagination: Pagination {
                    limit: fetch_options.limit.unwrap_or_default(),
                    page: fetch_options.page.unwrap_or_default(),
                    total,
                },
                results: cultures,
            });
        }
        transaction.commit().await?;
        resp
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

    async fn delete_culture(
        &self,
        ctx: &Context<'_>,
        delete_options: DeleteOptions,
    ) -> Result<Culture> {
        let pool = ctx.data::<DatabasePool>().expect("Pool must exist");
        let mut transaction = pool.begin().await?;

        let res = Culture::delete(&mut transaction, &delete_options).await?;

        transaction.commit().await?;
        Ok(res)
    }
}
