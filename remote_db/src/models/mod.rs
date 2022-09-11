use async_graphql::MergedObject;

use self::{
    buyer::{BuyerMutation, BuyerQuery},
    cell::{CellMutation, CellQuery},
    cell_culture_pair::{CellCulturePairMutation, CellCulturePairQuery},
    culture::{CultureMutation, CultureQuery},
    entry::{EntryMutation, EntryQuery},
};

pub mod buyer;
pub mod cell;
pub mod cell_culture_pair;
pub mod culture;
pub mod db_query;
pub mod entry;
pub mod weight_types;

pub const MAX_LIMIT: i64 = 100;
pub const DEFAULT_LIMIT: i64 = 10;

#[derive(MergedObject, Default)]
pub struct QueryRoot(
    BuyerQuery,
    CellCulturePairQuery,
    CellQuery,
    CultureQuery,
    EntryQuery,
);

#[derive(MergedObject, Default)]
pub struct MutationRoot(
    BuyerMutation,
    CellCulturePairMutation,
    CellMutation,
    CultureMutation,
    EntryMutation,
);
