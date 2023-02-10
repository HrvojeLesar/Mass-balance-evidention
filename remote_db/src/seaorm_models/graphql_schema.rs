use async_graphql::{Enum, InputObject, InputType, MergedObject, OutputType, SimpleObject};
use sea_orm::Order;

use super::{
    article::{ArticleFields, ArticleMutation, ArticleQuery},
    buyer::{BuyerFields, BuyerMutation, BuyerQuery},
    cell::{CellFields, CellMutation, CellParity, CellQuery},
    cell_culture_pair::{
        CellCulturePairFields, CellCulturePairIds, CellCulturePairMutation, CellCulturePairQuery,
    },
    culture::{CultureFields, CultureMutation, CultureParity, CultureQuery},
    data_group::{DataGroupFields, DataGroupMutation, DataGroupQuery},
    dispatch_note::{DispatchNoteFields, DispatchNoteMutation, DispatchNoteQuery},
    dispatch_note_article::{
        DispatchNoteArticleFields, DispatchNoteArticleIds, DispatchNoteArticleMutation,
        DispatchNoteArticleQuery,
    },
    entry::{EntryFields, EntryMutation, EntryQuery},
    QueryResultsTrait,
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
    ArticleQuery,
    DispatchNoteQuery,
    DispatchNoteArticleQuery,
);

#[derive(MergedObject, Default)]
pub struct MutationRoot(
    BuyerMutation,
    CellMutation,
    CultureMutation,
    DataGroupMutation,
    CellCulturePairMutation,
    EntryMutation,
    ArticleMutation,
    DispatchNoteMutation,
    DispatchNoteArticleMutation,
);

#[derive(SimpleObject, Debug)]
#[graphql(concrete(name = "BuyerResult", params(super::buyer::Model)))]
#[graphql(concrete(name = "CellResult", params(super::cell::Model)))]
#[graphql(concrete(name = "CultureResult", params(super::culture::Model)))]
#[graphql(concrete(name = "DataGroupResult", params(super::data_group::Model)))]
#[graphql(concrete(
    name = "CellCulturePairResult",
    params(super::cell_culture_pair::CellCulturePair)
))]
#[graphql(concrete(name = "EntryResult", params(super::entry::Entry)))]
#[graphql(concrete(name = "ArticleResults", params(super::article::Model)))]
#[graphql(concrete(name = "DispatchNoteResults", params(super::dispatch_note::Model)))]
#[graphql(concrete(
    name = "DispatchNoteArticleResults",
    params(super::dispatch_note_article::DispatchNoteArticle)
))]
pub struct QueryResults<T: OutputType> {
    pub results: Vec<T>,
    #[graphql(flatten)]
    pub pagination: Pagination,
}

impl<T> QueryResultsTrait<T> for QueryResults<T>
where
    T: OutputType,
{
    fn get_results(&self) -> &[T] {
        self.results.as_ref()
    }
}

#[derive(InputObject)]
#[graphql(concrete(name = "DeleteOptions", params()))]
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
#[graphql(concrete(name = "ArticleOrderingOptions", params(ArticleFields)))]
#[graphql(concrete(name = "DispatchNoteOrderingOptions", params(DispatchNoteFields)))]
#[graphql(concrete(
    name = "DispatchNoteArticleOrderingOptions",
    params(DispatchNoteArticleFields)
))]
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
#[graphql(concrete(name = "ArticleFilterOptions", params(ArticleFields)))]
#[graphql(concrete(name = "DispatchNoteFilterOptions", params(DispatchNoteFields)))]
#[graphql(concrete(
    name = "DispatchNoteArticleFilterOptions",
    params(DispatchNoteArticleFields)
))]
pub struct Filter<T: InputType> {
    pub field: T,
    pub field_type: FieldTypes,
    pub value: String,
}

type OptionalCellCulturePairIds = Option<CellCulturePairIds>;
type OptionalDispatchNoteArticleIds = Option<DispatchNoteArticleIds>;

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
#[graphql(concrete(name = "ArticleFetchOptions", params(ArticleFields)))]
#[graphql(concrete(name = "DispatchNoteFetchOptions", params(DispatchNoteFields)))]
#[graphql(concrete(
    name = "DispatchNoteArticleFetchOptions",
    params(DispatchNoteArticleFields, OptionalDispatchNoteArticleIds)
))]
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
