use async_graphql::{Enum, InputObject, InputType, MergedObject, SimpleObject};
use sea_orm::Order;

use super::{
    buyer::{BuyerFields, BuyerMutation, BuyerQuery},
    cell::{CellFields, CellMutation, CellParity, CellQuery},
    cell_culture_pair::{
        CellCulturePairFields, CellCulturePairIds, CellCulturePairMutation, CellCulturePairQuery,
    },
    culture::{CultureFields, CultureMutation, CultureParity, CultureQuery},
    data_group::{DataGroupFields, DataGroupMutation, DataGroupQuery},
    entry::{EntryFields, EntryMutation, EntryQuery},
};

#[derive(Enum, Clone, Copy, PartialEq, Eq)]
pub enum Ordering {
    Asc,
    Desc,
}

impl From<Ordering> for Order {
    fn from(ordering: Ordering) -> Self {
        match ordering {
            Ordering::Asc => Order::Asc,
            Ordering::Desc => Order::Desc,
        }
    }
}

#[derive(Enum, Clone, Copy, PartialEq, Eq)]
pub enum FieldTypes {
    String,
    Number,
    Date,
}

#[derive(SimpleObject, Debug)]
pub struct Pagination {
    pub page: u64,
    pub page_size: u64,
    pub total_items: u64,
    pub total_pages: u64,
}

#[derive(MergedObject, Default)]
pub struct QueryRoot(
    BuyerQuery,
    CellQuery,
    CultureQuery,
    DataGroupQuery,
    CellCulturePairQuery,
    EntryQuery,
);

#[derive(MergedObject, Default)]
pub struct MutationRoot(
    BuyerMutation,
    CellMutation,
    CultureMutation,
    DataGroupMutation,
    CellCulturePairMutation,
    EntryMutation,
);

#[derive(InputObject)]
#[graphql(concrete(name = "DeleteOptions", params()))]
#[graphql(concrete(name = "CellCulturePairDeleteOptions", params(CellCulturePairIds)))]
pub struct DeleteOptions<T: InputType = i32> {
    pub id: T,
}

#[derive(InputObject)]
#[graphql(concrete(name = "BuyerOrderingOptions", params(BuyerFields)))]
#[graphql(concrete(name = "CellOrderingOptions", params(CellFields)))]
#[graphql(concrete(name = "CultureOrderingOptions", params(CultureFields)))]
#[graphql(concrete(name = "DataGroupOrderingOptions", params(DataGroupFields)))]
#[graphql(concrete(name = "CellCultureOrderingOptions", params(CellCulturePairFields)))]
#[graphql(concrete(name = "EntryOrderingOptions", params(EntryFields)))]
pub struct OrderingOptions<T: InputType> {
    pub order: Ordering,
    pub order_by: T,
}

#[derive(InputObject)]
#[graphql(concrete(name = "BuyerFilterOptions", params(BuyerFields)))]
#[graphql(concrete(name = "CellFilterOptions", params(CellFields)))]
#[graphql(concrete(name = "CultureFilterOptions", params(CultureFields)))]
#[graphql(concrete(name = "DataGroupFilterOptions", params(DataGroupFields)))]
#[graphql(concrete(name = "CellCultureFilterOptions", params(CellCulturePairFields)))]
#[graphql(concrete(name = "EntryFilterOptions", params(EntryFields)))]
pub struct Filter<T: InputType> {
    pub field: T,
    pub field_type: FieldTypes,
    pub value: String,
}

type OptionalCellCulturePairIds = Option<CellCulturePairIds>;

#[derive(InputObject)]
#[graphql(concrete(name = "BuyerFetchOptions", params(BuyerFields)))]
#[graphql(concrete(name = "CellFetchOptions", params(CellFields)))]
#[graphql(concrete(name = "CultureFetchOptions", params(CultureFields)))]
#[graphql(concrete(name = "DataGroupFetchOptions", params(DataGroupFields)))]
#[graphql(concrete(name = "CellParityFetchOptions", params(CellFields, CellParity)))]
#[graphql(concrete(
    name = "CultureParityFetchOptions",
    params(CultureFields, CultureParity)
))]
#[graphql(concrete(
    name = "CellCultureFetchOptions",
    params(CellCulturePairFields, OptionalCellCulturePairIds)
))]
#[graphql(concrete(name = "EntryFetchOptions", params(EntryFields)))]
pub struct FetchOptions<T, I = Option<i32>, O = T>
where
    T: InputType,
    O: InputType,
    I: InputType,
    Filter<T>: InputType,
    OrderingOptions<O>: InputType,
{
    pub id: I,
    pub page_size: Option<u64>,
    pub page: Option<u64>,
    pub ordering: Option<OrderingOptions<O>>,
    pub filters: Option<Vec<Filter<T>>>,
    pub data_group_id: Option<i32>,
}
