use std::marker::PhantomData;

use async_graphql::{
    Context, Enum, Guard, InputObject, InputType, MergedObject, OutputType, SimpleObject,
};
use async_trait::async_trait;
use sea_orm::{ColumnTrait, EntityTrait, Order, QueryFilter, TransactionTrait};

use crate::{
    auth::SessionData,
    http_response_errors::AuthError,
    user_models::{
        mbe_group::{MbeGroupMutation, MbeGroupQuery},
        mbe_group_members::{self, MbeGroupMembersMutation, MbeGroupMembersQuery},
        mbe_user::MbeUserMutation,
    },
    SeaOrmPool,
};

use super::{
    article::{ArticleFields, ArticleMutation, ArticleQuery},
    buyer::{BuyerFields, BuyerMutation, BuyerQuery},
    cell::{CellFields, CellMutation, CellParity, CellQuery},
    cell_culture_pair::{
        CellCulturePairFields, CellCulturePairIds, CellCulturePairMutation, CellCulturePairQuery,
    },
    culture::{CultureFields, CultureMutation, CultureParity, CultureQuery},
    data_group,
    data_group::{DataGroupFields, DataGroupMutation, DataGroupQuery},
    dispatch_note::{
        DispatchNoteFields, DispatchNoteFilterValue, DispatchNoteMutation, DispatchNoteQuery,
    },
    dispatch_note_article::{
        DispatchNoteArticleFields, DispatchNoteArticleIds, DispatchNoteArticleMutation,
        DispatchNoteArticleQuery,
    },
    entry::{EntryFields, EntryMutation, EntryQuery},
    weight_type::{WeightTypeDeleteOptions, WeightTypeFields, WeightTypeMutation, WeightTypeQuery},
    GetEntityDataGroupId, GetEntityId, QueryResultsTrait,
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
    MbeGroupQuery,
    MbeGroupMembersQuery,
    WeightTypeQuery,
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
    MbeGroupMutation,
    MbeGroupMembersMutation,
    MbeUserMutation,
    WeightTypeMutation,
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
#[graphql(concrete(name = "WeightTypeResults", params(super::weight_type::Model)))]
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
#[graphql(concrete(name = "DeleteOptionsWeightType", params(WeightTypeDeleteOptions)))]
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
#[graphql(concrete(name = "WeightTypeOrderingOptions", params(WeightTypeFields)))]
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
#[graphql(concrete(
    name = "DispatchNoteFilterOptions",
    params(DispatchNoteFields, DispatchNoteFilterValue)
))]
// #[graphql(concrete(
//     name = "DispatchNoteFilterOptions",
//     params(DispatchNoteFields)
// ))]
#[graphql(concrete(
    name = "DispatchNoteArticleFilterOptions",
    params(DispatchNoteArticleFields)
))]
#[graphql(concrete(name = "WeightTypeFilterOptions", params(WeightTypeFields)))]
pub struct Filter<T: InputType, V: InputType = String> {
    pub field: T,
    // TODO: Make value something that implements some kind of trait
    pub value: V,
}

type OptionalCellCulturePairIds = Option<CellCulturePairIds>;
type OptionalDispatchNoteArticleIds = Option<DispatchNoteArticleIds>;
type OptionalI = Option<i32>;

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
#[graphql(concrete(
    name = "DispatchNoteFetchOptions",
    params(DispatchNoteFields, OptionalI, DispatchNoteFilterValue)
))]
#[graphql(concrete(
    name = "DispatchNoteArticleFetchOptions",
    params(DispatchNoteArticleFields, OptionalDispatchNoteArticleIds)
))]
pub struct FetchOptions<T, I = Option<i32>, V = String, O = T>
where
    T: InputType,
    O: InputType,
    I: InputType,
    V: InputType,
    Filter<T, V>: InputType,
    OrderingOptions<O>: InputType,
{
    pub id: I,
    pub page_size: Option<u64>,
    pub page: Option<u64>,
    pub ordering: Option<OrderingOptions<O>>,
    pub filters: Option<Vec<Filter<T, V>>>,
    pub d_group: i32,
}

#[derive(InputObject)]
#[graphql(concrete(name = "WeightTypeFetchOptions", params(WeightTypeFields)))]
pub struct WeightTypeFetchOptions<T, V = String, O = T>
where
    T: InputType,
    O: InputType,
    V: InputType,
    Filter<T, V>: InputType,
    OrderingOptions<O>: InputType,
{
    pub id: Option<i32>,
    pub page_size: Option<u64>,
    pub page: Option<u64>,
    pub ordering: Option<OrderingOptions<O>>,
    pub filters: Option<Vec<Filter<T, V>>>,
    pub mbe_group_id: i32,
}

pub struct DataGroupAccessGuard {
    data_group_id: i32,
}

impl DataGroupAccessGuard {
    pub fn new(data_group_id: i32) -> Self {
        Self { data_group_id }
    }
}

#[async_trait]
impl Guard for DataGroupAccessGuard {
    async fn check(&self, ctx: &Context<'_>) -> Result<(), async_graphql::Error> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");
        // let session_data = ctx.data::<SessionData>()?;
        let transaction = db.begin().await?;

        let id_mbe_group = data_group::Entity::find()
            .filter(data_group::Column::Id.eq(self.data_group_id))
            .one(&transaction)
            .await?
            .ok_or(AuthError::Unauthorized)?
            .id_mbe_group;

        transaction.commit().await?;

        MbeGroupAccessGuard::new(id_mbe_group).check(ctx).await?;

        // let is_group_member = mbe_group_members::Entity::find()
        //     .filter(mbe_group_members::Column::IdMbeUser.eq(session_data.user_id))
        //     .filter(mbe_group_members::Column::IdMbeGroup.eq(id_mbe_group))
        //     .one(&transaction)
        //     .await?;

        // if is_group_member.is_some() {
        //     Ok(())
        // } else {
        //     Err(AuthError::Unauthorized.into())
        // }

        Ok(())
    }
}

pub struct UpdateDeleteGuard<T>
where
    T: EntityTrait + GetEntityId<<T as EntityTrait>::Column>,
    <T as EntityTrait>::Model: GetEntityDataGroupId,
{
    id: i32,
    phantom: PhantomData<T>,
}

impl<T> UpdateDeleteGuard<T>
where
    T: EntityTrait + GetEntityId<<T as EntityTrait>::Column>,
    <T as EntityTrait>::Model: GetEntityDataGroupId,
{
    pub fn new(entity_id: i32) -> Self {
        Self {
            id: entity_id,
            phantom: PhantomData,
        }
    }
}

#[async_trait]
impl<T> Guard for UpdateDeleteGuard<T>
where
    T: EntityTrait + GetEntityId<<T as EntityTrait>::Column>,
    <T as EntityTrait>::Model: GetEntityDataGroupId,
{
    async fn check(&self, ctx: &Context<'_>) -> Result<(), async_graphql::Error> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");

        let transaction = db.begin().await?;

        let d_group = <T as EntityTrait>::find()
            .filter(<T as GetEntityId<<T as EntityTrait>::Column>>::get_id_column().eq(self.id))
            .one(&transaction)
            .await?
            .ok_or(AuthError::Unauthorized)?
            .get_data_group_id();

        transaction.commit().await?;

        DataGroupAccessGuard::new(d_group).check(ctx).await?;

        Ok(())
    }
}

pub fn extract_session<'a>(ctx: &Context<'a>) -> Result<&'a SessionData, AuthError> {
    ctx.data::<SessionData>()
        // WARN: Throwing away other errors
        .map_err(|_e| AuthError::Unauthorized)
}

pub struct MbeGroupAccessGuard {
    id_mbe_group: i32,
}

impl MbeGroupAccessGuard {
    pub fn new(id_mbe_group: i32) -> Self {
        Self { id_mbe_group }
    }
}

#[async_trait]
impl Guard for MbeGroupAccessGuard {
    async fn check(&self, ctx: &Context<'_>) -> Result<(), async_graphql::Error> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");
        let session_data = ctx.data::<SessionData>()?;
        let transaction = db.begin().await?;

        let is_group_member = mbe_group_members::Entity::find()
            .filter(mbe_group_members::Column::IdMbeUser.eq(session_data.user_id))
            .filter(mbe_group_members::Column::IdMbeGroup.eq(self.id_mbe_group))
            .one(&transaction)
            .await?;

        transaction.commit().await?;

        if is_group_member.is_some() {
            Ok(())
        } else {
            Err(AuthError::Unauthorized.into())
        }
    }
}
