use anyhow::Result;
use async_graphql::{Enum, InputObject, InputType, MergedObject, OutputType, SimpleObject};
use sqlx::{postgres::PgRow, Row};

use self::{
    buyer::{Buyer, BuyerFields, BuyerMutation, BuyerQuery},
    cell::{Cell, CellFields, CellMutation, CellQuery},
    cell_culture_pair::{
        CellCulturePair, CellCulturePairFields, CellCulturePairIds, CellCulturePairMutation,
        CellCulturePairQuery,
    },
    culture::{Culture, CultureFields, CultureMutation, CultureQuery},
    entry::{EntryMutation, EntryQuery, EntryFields, Entry},
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

impl ToString for Ordering {
    fn to_string(&self) -> String {
        match self {
            Ordering::Asc => "ASC".to_string(),
            Ordering::Desc => "DESC".to_string(),
        }
    }
}

#[derive(InputObject)]
#[graphql(concrete(name = "BuyerOrderingOptions", params(BuyerFields)))]
#[graphql(concrete(name = "CellOrderingOptions", params(CellFields)))]
#[graphql(concrete(name = "CultureOrderingOptions", params(CultureFields)))]
#[graphql(concrete(name = "CellCulturePairOrderingOptions", params(CellCulturePairFields)))]
#[graphql(concrete(name = "EntryOrderingOptions", params(EntryFields)))]
pub(super) struct OrderingOptions<T: InputType + ToString> {
    order: Ordering,
    order_by: T,
}

#[derive(InputObject)]
#[graphql(concrete(name = "BuyerFilterOptions", params(BuyerFields)))]
#[graphql(concrete(name = "CellFilterOptions", params(CellFields)))]
#[graphql(concrete(name = "CultureFilterOptions", params(CultureFields)))]
#[graphql(concrete(name = "CellCulturePairFilterOptions", params(CellCulturePairFields)))]
#[graphql(concrete(name = "EntryFilterOptions", params(EntryFields)))]
pub(super) struct Filter<T: InputType + FieldsToSql> {
    pub(super) field: T,
    pub(super) value: String,
}

#[derive(InputObject)]
pub struct Id {
    pub id: Option<i32>,
}

#[derive(InputObject)]
#[graphql(concrete(name = "BuyerFetchOptions", params(BuyerFields)))]
#[graphql(concrete(name = "CellFetchOptions", params(CellFields)))]
#[graphql(concrete(name = "CultureFetchOptions", params(CultureFields)))]
#[graphql(concrete(
    name = "CellCulturePairFetchOptions",
    params(CellCulturePairFields, CellCulturePairIds)
))]
#[graphql(concrete(name = "EntryFetchOptions", params(EntryFields)))]
pub(super) struct FetchOptions<T, I = Id>
where
    T: InputType + FieldsToSql + ToString,
    I: InputType,
    Filter<T>: InputType,
    OrderingOptions<T>: InputType,
{
    pub(super) id: I,
    pub(super) limit: Option<i64>,
    pub(super) page: Option<i64>,
    pub(super) ordering: Option<OrderingOptions<T>>,
    pub(super) filters: Option<Vec<Filter<T>>>,
}

#[derive(SimpleObject, Debug)]
#[graphql(concrete(name = "Buyers", params(Buyer)))]
#[graphql(concrete(name = "Cells", params(Cell)))]
#[graphql(concrete(name = "Cultures", params(Culture)))]
#[graphql(concrete(name = "CellCulturePairs", params(CellCulturePair)))]
#[graphql(concrete(name = "Entries", params(Entry)))]
pub(super) struct FetchMany<T: OutputType> {
    #[graphql(flatten)]
    pub(super) pagination: Pagination,
    pub(super) results: Vec<T>,
}

pub trait FieldsToSql: ToString {
    fn to_sql(&self) -> String {
        format!("{} % ", self.to_string())
    }
}
