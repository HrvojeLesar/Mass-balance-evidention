use async_graphql::{Enum, InputObject, InputType, MergedObject, OutputType, SimpleObject};

use self::{
    buyer::{Buyer, BuyerFields, BuyerMutation, BuyerQuery},
    cell::{Cell, CellFields, CellMutation, CellQuery, CellUnpairedId},
    cell_culture_pair::{
        CellCultureOrderingFields, CellCulturePair, CellCulturePairFields, CellCulturePairIds,
        CellCulturePairMutation, CellCulturePairQuery, OptionalCellCulturePairIds,
    },
    culture::{Culture, CultureFields, CultureMutation, CultureQuery, CultureUnpairedId},
    entry::{
        Entry, EntryFetchIdOptions, EntryFields, EntryGroup, EntryGroupFields, EntryMutation,
        EntryQuery, EntryOrderingFields,
    },
};

pub mod buyer;
pub mod cell;
pub mod cell_culture_pair;
pub mod culture;
pub mod db_query;
pub mod entry;
pub mod weight_types;
pub mod data_group;

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
#[graphql(concrete(
    name = "CellCulturePairOrderingOptions",
    params(CellCultureOrderingFields)
))]
#[graphql(concrete(name = "EntryOrderingOptions", params(EntryOrderingFields)))]
#[graphql(concrete(name = "EntryGroupOrderingOptionsBase", params(EntryGroupFields)))]
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
#[graphql(concrete(name = "EntryGroupFilterOptionsBase", params(EntryGroupFields)))]
pub(super) struct Filter<T: InputType + FieldsToSql> {
    pub(super) field: T,
    pub(super) value: String,
}

#[derive(InputObject)]
pub struct OptionalId {
    pub id: Option<i32>,
}

#[derive(InputObject)]
#[graphql(concrete(name = "BuyerFetchOptions", params(BuyerFields)))]
#[graphql(concrete(name = "CellFetchOptions", params(CellFields)))]
#[graphql(concrete(name = "CellFetchUnpairedOptions", params(CellFields, CellUnpairedId)))]
#[graphql(concrete(name = "CultureFetchOptions", params(CultureFields)))]
#[graphql(concrete(
    name = "CultureFetchUnpairedOptions",
    params(CultureFields, CultureUnpairedId)
))]
#[graphql(concrete(
    name = "CellCulturePairFetchOptions",
    params(
        CellCulturePairFields,
        OptionalCellCulturePairIds,
        CellCultureOrderingFields
    )
))]
#[graphql(concrete(name = "EntryFetchOptions", params(EntryFields, EntryFetchIdOptions, EntryOrderingFields)))]
#[graphql(concrete(name = "EntryGroupFetchOptionsBase", params(EntryGroupFields)))]
pub(super) struct FetchOptions<T, I = OptionalId, O = T>
where
    T: InputType + FieldsToSql + ToString,
    O: InputType + FieldsToSql + ToString,
    I: InputType,
    Filter<T>: InputType,
    OrderingOptions<O>: InputType,
{
    pub(super) id: I,
    pub(super) limit: Option<i64>,
    pub(super) page: Option<i64>,
    pub(super) ordering: Option<OrderingOptions<O>>,
    pub(super) filters: Option<Vec<Filter<T>>>,
    pub(super) data_group_id: Option<i32>,
}

#[derive(SimpleObject, Debug)]
#[graphql(concrete(name = "Buyers", params(Buyer)))]
#[graphql(concrete(name = "Cells", params(Cell)))]
#[graphql(concrete(name = "Cultures", params(Culture)))]
#[graphql(concrete(name = "CellCulturePairs", params(CellCulturePair)))]
#[graphql(concrete(name = "Entries", params(Entry)))]
#[graphql(concrete(name = "EntryGroups", params(EntryGroup)))]
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

#[derive(InputObject)]
#[graphql(concrete(name = "DeleteOptions", params()))]
#[graphql(concrete(name = "CellCulturePairDeleteOptions", params(CellCulturePairIds)))]
pub(super) struct DeleteOptions<T: InputType = i32> {
    id: T,
}
