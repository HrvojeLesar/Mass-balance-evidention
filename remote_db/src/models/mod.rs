use anyhow::Result;
use async_graphql::Object;

pub mod buyer;
pub mod cell;
pub mod cell_culture_pair;
pub mod culture;
pub mod entry;
pub mod weight_types;

pub struct QueryRoot;

#[Object]
impl QueryRoot {
    async fn empty(&self) -> Result<&str> {
        unimplemented!()
    }
}

// pub struct MutationRoot;

// #[Object]
// impl MutationRoot {}
