use async_graphql::MergedObject;

use self::cell::{CellMutation, CellQuery};

pub mod buyer;
pub mod cell;
pub mod cell_culture_pair;
pub mod culture;
pub mod entry;
pub mod weight_types;
pub mod db_query;

pub const MAX_LIMIT: i64 = 100;
pub const DEFAULT_LIMIT: i64 = 10;

#[derive(MergedObject, Default)]
pub struct QueryRoot(CellQuery);

#[derive(MergedObject, Default)]
pub struct MutationRoot(CellMutation);
