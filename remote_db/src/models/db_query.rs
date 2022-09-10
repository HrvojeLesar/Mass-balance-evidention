use anyhow::Result;
use async_trait::async_trait;
use sqlx::Executor;

pub(crate) trait InputOptions {}
pub(crate) trait GetOptions {}
pub(crate) trait UpdateOptions {}
pub(crate) trait QueryResult {}

pub(crate) struct EmptyInputOptions {}
pub(crate) struct EmptyGetOptions {}
pub(crate) struct EmptyUpdateOptions {}
pub(crate) struct EmptyQueryResult {}

impl InputOptions for EmptyInputOptions {}
impl GetOptions for EmptyGetOptions {}
impl UpdateOptions for EmptyUpdateOptions {}
impl QueryResult for EmptyQueryResult {}

#[async_trait]
pub(crate) trait DatabaseQueries<DB>
where
    Self: Sized,
{
    type IO;

    type GO;

    type UO;

    async fn insert<'e, 'c: 'e, E>(executor: E, options: &Self::IO) -> Result<Self>
    where
        E: 'e + Executor<'c, Database = DB>;

    async fn get_many<'e, 'c: 'e, E>(executor: E, options: &Self::GO) -> Result<Vec<Self>>
    where
        E: 'e + Executor<'c, Database = DB>;

    async fn get<'e, 'c: 'e, E>(executor: E, options: &Self::GO) -> Result<Option<Self>>
    where
        E: 'e + Executor<'c, Database = DB>;

    async fn update<'e, 'c: 'e, E>(executor: E, options: &Self::UO) -> Result<Option<Self>>
    where
        E: 'e + Executor<'c, Database = DB>;
}
