use async_graphql::{Context, Enum, InputObject, Object, SimpleObject};
use async_trait::async_trait;
use sea_orm::{
    entity::prelude::*,
    sea_query::{Expr, Func, Query},
    ActiveValue, Condition, DatabaseTransaction, DeleteResult, TransactionTrait,
};
use serde::{Deserialize, Serialize};

use crate::SeaOrmPool;

use super::{
    calculate_page_size, common_add_id_and_data_group_filters, common_add_ordering,
    graphql_schema::{
        DataGroupAccessGuard, DeleteOptions, FetchOptions, Filter, OrderingOptions,
        UpdateDeleteGuard,
    },
    GetDataGroupColumnTrait, GetEntityDataGroupId, GetEntityId, Page, PageSize, QueryDatabase,
    QueryResults, RowsDeleted,
};

use anyhow::Result;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize, SimpleObject)]
#[sea_orm(table_name = "culture")]
#[graphql(name = "Culture")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub name: String,
    #[sea_orm(column_type = "Text", nullable)]
    pub description: Option<String>,
    pub created_at: DateTimeWithTimeZone,
    pub d_group: i32,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(has_many = "super::cell_culture_pair::Entity")]
    CellCulturePair,
    #[sea_orm(
        belongs_to = "super::data_group::Entity",
        from = "Column::DGroup",
        to = "super::data_group::Column::Id",
        on_update = "NoAction",
        on_delete = "NoAction"
    )]
    DataGroup,
}

impl Related<super::cell_culture_pair::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::CellCulturePair.def()
    }
}

impl Related<super::data_group::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::DataGroup.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}

#[derive(Enum, Clone, Copy, PartialEq, Eq)]
pub enum CultureFields {
    Id,
    Name,
    Description,
}

#[derive(Debug, InputObject)]
pub struct CultureParity {
    /// Id refers to a Cell Id
    pub id_cell: Option<i32>,
}

impl From<CultureFields> for Column {
    fn from(fields: CultureFields) -> Self {
        match fields {
            CultureFields::Id => Column::Id,
            CultureFields::Name => Column::Name,
            CultureFields::Description => Column::Description,
        }
    }
}

#[allow(clippy::derivable_impls)]
impl Default for Column {
    fn default() -> Self {
        Column::Id
    }
}

impl GetDataGroupColumnTrait<Column> for Entity {
    fn get_data_group_column() -> Column {
        Column::DGroup
    }
    fn get_id_column() -> Column {
        Column::Id
    }
}

#[derive(InputObject)]
pub struct CultureUpdateOptions {
    pub id: i32,
    pub name: Option<String>,
    pub description: Option<String>,
}

#[derive(InputObject)]
pub struct CultureInsertOptions {
    pub name: String,
    pub description: Option<String>,
    pub d_group: i32,
}

#[async_trait]
impl QueryDatabase for Entity {
    type InnerQueryResultType = Model;

    type QueryResultType = QueryResults<Self::InnerQueryResultType>;

    type FetchModel = Model;

    type InsertOptions = CultureInsertOptions;

    type UpdateOptions = CultureUpdateOptions;

    type InputFields = CultureFields;

    type DeleteOptionsType = i32;

    type FetchIdType = Option<i32>;

    type FilterValueType = String;

    async fn delete_query(
        transaction: &DatabaseTransaction,
        options: DeleteOptions<Self::DeleteOptionsType>,
    ) -> Result<DeleteResult> {
        Ok(Self::delete_by_id(options.id).exec(transaction).await?)
    }

    fn add_id_and_data_group_filters(
        query: Select<Self>,
        fetch_options: &FetchOptions<Self::InputFields, Self::FetchIdType, Self::FilterValueType>,
    ) -> Select<Self> {
        common_add_id_and_data_group_filters(query, fetch_options)
    }

    async fn update_entity(
        db: &DatabaseConnection,
        options: Self::UpdateOptions,
    ) -> Result<Self::InnerQueryResultType> {
        let model = ActiveModel {
            id: ActiveValue::Set(options.id),
            name: options.name.map_or(ActiveValue::NotSet, ActiveValue::Set),
            description: options
                .description
                .map_or(ActiveValue::NotSet, |val| ActiveValue::Set(Some(val))),
            ..Default::default()
        };
        let transaction = db.begin().await?;
        let res = Entity::update(model).exec(&transaction).await?;
        transaction.commit().await?;

        Ok(res)
    }

    async fn insert_entity(
        db: &DatabaseConnection,
        options: Self::InsertOptions,
    ) -> Result<Self::InnerQueryResultType> {
        let model = ActiveModel {
            name: ActiveValue::Set(options.name),
            description: ActiveValue::Set(options.description),
            d_group: ActiveValue::Set(options.d_group),
            ..Default::default()
        };
        let transaction = db.begin().await?;
        let res = Entity::insert(model)
            .exec_with_returning(&transaction)
            .await?;
        transaction.commit().await?;
        Ok(res)
    }

    fn add_filter(query: Select<Self>, filter: Filter<Self::InputFields>) -> Select<Self> {
        let column: Self::Column = filter.field.into();
        match filter.field {
            CultureFields::Name | CultureFields::Description => query.filter(
                Expr::expr(Func::lower(Expr::col((Entity, column))))
                    .like(format!("%{}%", filter.value.trim().to_lowercase())),
            ),
            CultureFields::Id => query,
        }
    }

    fn add_ordering(
        query: Select<Self>,
        ordering_options: Option<OrderingOptions<Self::InputFields>>,
    ) -> Select<Self> {
        common_add_ordering(query, ordering_options)
    }
}

#[derive(Default)]
pub struct CultureQuery;

#[Object]
impl CultureQuery {
    #[graphql(guard = "DataGroupAccessGuard::new(options.d_group)")]
    async fn cultures(
        &self,
        ctx: &Context<'_>,
        options: FetchOptions<CultureFields>,
    ) -> Result<QueryResults<Model>> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");
        Entity::fetch(db, options).await
    }

    #[graphql(guard = "DataGroupAccessGuard::new(options.d_group)")]
    async fn paired_cultures(
        &self,
        ctx: &Context<'_>,
        options: FetchOptions<CultureFields, CultureParity>,
    ) -> Result<QueryResults<Model>> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");

        let page_size = PageSize(calculate_page_size(options.page_size));
        let page: Page = options.page.into();

        let mut query = Entity::find();
        query = query.filter(Entity::get_data_group_column().eq(options.d_group));
        query = Entity::add_ordering(query, options.ordering);
        query = Entity::add_filters(query, options.filters);
        if let Some(id_cell) = options.id.id_cell {
            query = query.filter(
                Condition::any().add(
                    Column::Id.in_subquery(
                        Query::select()
                            .column(super::cell_culture_pair::Column::IdCulture)
                            .from(super::cell_culture_pair::Entity)
                            .and_where(super::cell_culture_pair::Column::IdCell.eq(id_cell))
                            .to_owned(),
                    ),
                ),
            );
        }

        let transaction = db.begin().await?;

        let paginator = Entity::paginate_query(query, &transaction, page_size);
        let res = paginator.fetch_page(page.index).await?;
        let num_items_and_pages = paginator.num_items_and_pages().await?;

        transaction.commit().await?;
        Ok((res, num_items_and_pages, page, page_size).into())
    }

    #[graphql(guard = "DataGroupAccessGuard::new(options.d_group)")]
    async fn unpaired_cultures(
        &self,
        ctx: &Context<'_>,
        options: FetchOptions<CultureFields, CultureParity>,
    ) -> Result<QueryResults<Model>> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");

        let page_size = PageSize(calculate_page_size(options.page_size));
        let page: Page = options.page.into();

        let mut query = Entity::find();
        query = query.filter(Entity::get_data_group_column().eq(options.d_group));
        query = Entity::add_ordering(query, options.ordering);
        query = Entity::add_filters(query, options.filters);
        query = query.filter(
            Condition::any().add(
                Column::Id.not_in_subquery(
                    Query::select()
                        .column(super::cell_culture_pair::Column::IdCulture)
                        .from(super::cell_culture_pair::Entity)
                        .and_where(super::cell_culture_pair::Column::IdCell.eq(options.id.id_cell))
                        .to_owned(),
                ),
            ),
        );

        let transaction = db.begin().await?;

        let paginator = Entity::paginate_query(query, &transaction, page_size);
        let res = paginator.fetch_page(page.index).await?;
        let num_items_and_pages = paginator.num_items_and_pages().await?;

        transaction.commit().await?;
        Ok((res, num_items_and_pages, page, page_size).into())
    }
}

#[derive(Default)]
pub struct CultureMutation;

#[Object]
impl CultureMutation {
    #[graphql(guard = "DataGroupAccessGuard::new(options.d_group)")]
    async fn insert_culture(
        &self,
        ctx: &Context<'_>,
        options: CultureInsertOptions,
    ) -> Result<Model> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");
        Entity::insert_entity(db, options).await
    }

    #[graphql(guard = "UpdateDeleteGuard::<Entity>::new(options.id)")]
    async fn update_culture(
        &self,
        ctx: &Context<'_>,
        options: CultureUpdateOptions,
    ) -> Result<Model> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");
        Entity::update_entity(db, options).await
    }

    #[graphql(guard = "UpdateDeleteGuard::<Entity>::new(options.id)")]
    async fn delete_culture(
        &self,
        ctx: &Context<'_>,
        options: DeleteOptions,
    ) -> Result<RowsDeleted> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");
        Entity::delete_entity(db, options).await
    }
}

impl GetEntityId<Column> for Entity {
    fn get_id_column() -> Column {
        Column::Id
    }
}

impl GetEntityDataGroupId for Model {
    fn get_data_group_id(&self) -> i32 {
        self.d_group
    }
}
