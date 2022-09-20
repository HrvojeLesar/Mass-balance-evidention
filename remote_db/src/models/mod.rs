use async_graphql::{Enum, InputObject, InputType, MergedObject, SimpleObject, OutputType};

use self::{
    buyer::{BuyerFields, BuyerMutation, BuyerQuery, Buyer},
    cell::{CellMutation, CellQuery, CellFields, Cell},
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

#[derive(Enum, Clone, Copy, PartialEq, Eq)]
pub(super) enum Ordering {
    Asc,
    Desc,
}

impl Into<String> for Ordering {
    fn into(self) -> String {
        match self {
            Ordering::Asc => "ASC".to_string(),
            Ordering::Desc => "DESC".to_string(),
        }
    }
}

#[derive(InputObject)]
#[graphql(concrete(name = "BuyerOrderingOptions", params(BuyerFields)))]
#[graphql(concrete(name = "CellOrderingOptions", params(CellFields)))]
pub(super) struct OrderingOptions<T: InputType + Into<String>> {
    order: Ordering,
    order_by: T,
}

#[derive(InputObject)]
#[graphql(concrete(name = "BuyerFilterOptions", params(BuyerFields)))]
#[graphql(concrete(name = "CellFilterOptions", params(CellFields)))]
pub(super) struct Filter<T: InputType + FieldsToSql> {
    pub(super) field: T,
    pub(super) value: String,
}

#[derive(InputObject)]
#[graphql(concrete(name = "BuyerFetchOptions", params(BuyerFields)))]
#[graphql(concrete(name = "CellFetchOptions", params(CellFields)))]
pub(super) struct FetchOptions<T: InputType + FieldsToSql + Into<String>>
where
    Filter<T>: InputType,
    OrderingOptions<T>: InputType,
{
    pub(super) id: Option<i32>,
    pub(super) limit: Option<i64>,
    pub(super) page: Option<i64>,
    pub(super) ordering: Option<OrderingOptions<T>>,
    pub(super) filters: Option<Vec<Filter<T>>>,
}

#[derive(SimpleObject, Debug)]
#[graphql(concrete(name = "Buyers", params(Buyer)))]
#[graphql(concrete(name = "Cells", params(Cell)))]
pub(super) struct FetchMany<T: OutputType> 
{
    #[graphql(flatten)]
    pub(super) pagination: Pagination,
    pub(super) results: Vec<T>,
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
        None => DEFAULT_LIMIT,
    }
}

pub(crate) fn calc_offset(page: Option<i64>, limit: Option<i64>) -> i64 {
    let page = match page {
        Some(p) => {
            if p < 1 {
                0
            } else {
                p - 1
            }
        }
        None => 0,
    };

    page * calc_limit(limit)
}

pub trait FieldsToSql {
    fn to_sql(&self) -> String;
}
