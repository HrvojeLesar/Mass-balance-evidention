use anyhow::Result;
use async_trait::async_trait;
use sqlx::{Database, Transaction};

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
    DB: Database,
    Self: Sized,
{
    type IO;

    type FO;

    type UO;

    async fn insert(executor: &mut Transaction<'_, DB>, options: &Self::IO) -> Result<Self>;

    async fn get_many(executor: &mut Transaction<'_, DB>, options: &Self::FO) -> Result<Vec<Self>>;

    async fn get(executor: &mut Transaction<'_, DB>, options: &Self::FO) -> Result<Self>;

    async fn update(executor: &mut Transaction<'_, DB>, options: &Self::UO) -> Result<Self>;
}
