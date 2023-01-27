use async_graphql::{Enum, InputObject, InputType, MergedObject, OutputType, SimpleObject};
use sea_orm::Order;

use self::{
    buyer::{Buyer, BuyerFields, BuyerMutation, BuyerNew, BuyerQuery, NewBuyerQuery},
    cell::{Cell, CellFields, CellMutation, CellQuery, CellUnpairedId},
    cell_culture_pair::{
        CellCultureOrderingFields, CellCulturePair, CellCulturePairFields, CellCulturePairIds,
        CellCulturePairMutation, CellCulturePairQuery, OptionalCellCulturePairIds,
    },
    culture::{Culture, CultureFields, CultureMutation, CultureQuery, CultureUnpairedId},
    data_group::{DataGroupMutation, DataGroupQuery},
    entry::{
        Entry, EntryFetchIdOptions, EntryFields, EntryGroup, EntryGroupFields, EntryMutation,
        EntryOrderingFields, EntryQuery,
    },
};

pub mod buyer;
pub mod cell;
pub mod cell_culture_pair;
pub mod culture;
pub mod data_group;
pub mod db_query;
pub mod entry;
pub mod weight_types;

#[derive(MergedObject, Default)]
pub struct QueryRoot(
    BuyerQuery,
    CellCulturePairQuery,
    CellQuery,
    CultureQuery,
    EntryQuery,
    DataGroupQuery,
    NewBuyerQuery,
);

#[derive(MergedObject, Default)]
pub struct MutationRoot(
    BuyerMutation,
    CellCulturePairMutation,
    CellMutation,
    CultureMutation,
    EntryMutation,
    DataGroupMutation,
);

#[derive(SimpleObject, Debug)]
pub struct Pagination {
    pub page: i64,
    pub page_size: i64,
    pub total: i64,
}

#[derive(Enum, Clone, Copy, PartialEq, Eq)]
pub enum Ordering {
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

impl From<Ordering> for Order {
    fn from(ordering: Ordering) -> Self {
        match ordering {
            Ordering::Asc => Order::Asc,
            Ordering::Desc => Order::Desc,
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
pub struct OrderingOptions<T: InputType + ToString> {
    pub order: Ordering,
    pub order_by: T,
}

#[derive(InputObject)]
#[graphql(concrete(name = "BuyerFilterOptions", params(BuyerFields)))]
#[graphql(concrete(name = "CellFilterOptions", params(CellFields)))]
#[graphql(concrete(name = "CultureFilterOptions", params(CultureFields)))]
#[graphql(concrete(name = "CellCulturePairFilterOptions", params(CellCulturePairFields)))]
#[graphql(concrete(name = "EntryFilterOptions", params(EntryFields)))]
#[graphql(concrete(name = "EntryGroupFilterOptionsBase", params(EntryGroupFields)))]
pub struct Filter<T: InputType + FieldsToSql> {
    pub field: T,
    pub value: String,
}

#[derive(InputObject)]
pub struct OptionalId {
    pub id: Option<i32>,
}

#[derive(Enum, Clone, Copy, PartialEq, Eq)]
pub enum FieldTypes {
    String,
    Number,
    Date,
}

#[derive(InputObject)]
#[graphql(concrete(name = "BuyerFilterOptionsNew", params(BuyerFields)))]
#[graphql(concrete(name = "CellFilterOptionsNew", params(CellFields)))]
#[graphql(concrete(name = "CultureFilterOptionsNew", params(CultureFields)))]
#[graphql(concrete(
    name = "CellCulturePairFilterOptionsNew",
    params(CellCulturePairFields)
))]
#[graphql(concrete(name = "EntryFilterOptionsNew", params(EntryFields)))]
#[graphql(concrete(name = "EntryGroupFilterOptionsBaseNew", params(EntryGroupFields)))]
pub struct FilterNew<T: InputType> {
    pub field: T,
    pub field_type: FieldTypes,
    pub value: String,
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
#[graphql(concrete(
    name = "EntryFetchOptions",
    params(EntryFields, EntryFetchIdOptions, EntryOrderingFields)
))]
#[graphql(concrete(name = "EntryGroupFetchOptionsBase", params(EntryGroupFields)))]
pub struct FetchOptions<T, I = OptionalId, O = T>
where
    T: InputType + FieldsToSql + ToString,
    O: InputType + FieldsToSql + ToString,
    I: InputType,
    Filter<T>: InputType,
    FilterNew<T>: InputType,
    OrderingOptions<O>: InputType,
{
    pub id: I,
    pub page_size: Option<i64>,
    pub page: Option<i64>,
    pub ordering: Option<OrderingOptions<O>>,
    pub filters: Option<Vec<Filter<T>>>,
    pub filtersnew: Option<Vec<FilterNew<T>>>,
    pub data_group_id: Option<i32>,
}

#[derive(SimpleObject, Debug)]
#[graphql(concrete(name = "Buyers", params(Buyer)))]
#[graphql(concrete(name = "Cells", params(Cell)))]
#[graphql(concrete(name = "Cultures", params(Culture)))]
#[graphql(concrete(name = "CellCulturePairs", params(CellCulturePair)))]
#[graphql(concrete(name = "Entries", params(Entry)))]
#[graphql(concrete(name = "EntryGroups", params(EntryGroup)))]
#[graphql(concrete(name = "BuyersNew", params(BuyerNew)))]
pub struct FetchMany<T: OutputType> {
    #[graphql(flatten)]
    pub pagination: Pagination,
    pub results: Vec<T>,
}

pub trait FieldsToSql: ToString {
    fn to_sql(&self) -> String {
        format!("{} % ", self.to_string())
    }
}

#[derive(InputObject)]
#[graphql(concrete(name = "DeleteOptions", params()))]
#[graphql(concrete(name = "CellCulturePairDeleteOptions", params(CellCulturePairIds)))]
pub struct DeleteOptions<T: InputType = i32> {
    pub id: T,
}
