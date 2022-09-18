use async_graphql::{MergedObject, SimpleObject};

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

#[derive(SimpleObject, Debug)]
pub struct Pagination {
    limit: i64,
    page: i64,
    total: i64,
}

pub(crate) fn calc_limit(limit: Option<i64>) -> i64 {
    match limit {
        Some(l) => {
            if l <= MAX_LIMIT {
                l
            } else {
                DEFAULT_LIMIT
            }
        }
        None => DEFAULT_LIMIT
    }
}

pub(crate) fn calc_offset(page: Option<i64>, limit: Option<i64>) -> i64 {
    let page = match page {
        Some(p) => {
            if p < 1 { 0 } else { p - 1}
        }
        None => 0
    };

    page * calc_limit(limit)
}
