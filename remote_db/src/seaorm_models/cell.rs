use async_graphql::{Context, Enum, InputObject, Object, SimpleObject};
use async_trait::async_trait;
use sea_orm::{
    entity::prelude::*, sea_query::Query, ActiveValue, Condition, DatabaseTransaction,
    DeleteResult, TransactionTrait,
};
use serde::{Deserialize, Serialize};

use anyhow::Result;

use crate::SeaOrmPool;

use super::{
    calculate_page_size, common_add_filter, common_add_id_and_data_group_filters,
    common_add_ordering,
    graphql_schema::{DeleteOptions, FetchOptions, Filter, OrderingOptions},
    GetDataGroupColumnTrait, Page, PageSize, QueryDatabase, QueryResults, RowsDeleted,
};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize, SimpleObject)]
#[sea_orm(table_name = "cell")]
#[graphql(name = "Cell")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub name: String,
    #[sea_orm(column_type = "Text", nullable)]
    pub description: Option<String>,
    pub created_at: DateTimeWithTimeZone,
    pub d_group: Option<i32>,
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
pub enum CellFields {
    Id,
    Name,
    Description,
}

#[derive(Debug, InputObject)]
pub struct CellParity {
    /// Id refers to a Culture Id
    pub id_culture: Option<i32>,
}

impl From<CellFields> for Column {
    fn from(fields: CellFields) -> Self {
        match fields {
            CellFields::Id => Column::Id,
            CellFields::Name => Column::Name,
            CellFields::Description => Column::Description,
        }
    }
}

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
pub struct CellUpdateOptions {
    pub id: i32,
    pub name: Option<String>,
    pub description: Option<String>,
}

#[derive(InputObject)]
pub struct CellInsertOptions {
    pub name: String,
    pub description: Option<String>,
    pub d_group: Option<i32>,
}

#[async_trait]
impl QueryDatabase for Entity {
    type InnerQueryResultType = Model;

    type QueryResultType = QueryResults<Self::InnerQueryResultType>;

    type FetchModel = Model;

    type InsertOptions = CellInsertOptions;

    type UpdateOptions = CellUpdateOptions;

    type InputFields = CellFields;

    type DeleteOptionsType = i32;

    type FetchIdType = Option<i32>;

    fn add_id_and_data_group_filters(
        query: Select<Self>,
        fetch_options: &FetchOptions<Self::InputFields, Self::FetchIdType>,
    ) -> Select<Self> {
        common_add_id_and_data_group_filters(query, fetch_options)
    }

    async fn delete_query(
        transaction: &DatabaseTransaction,
        options: DeleteOptions<Self::DeleteOptionsType>,
    ) -> Result<DeleteResult> {
        Ok(Self::delete_by_id(options.id).exec(transaction).await?)
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
        common_add_filter(query, filter)
    }

    fn add_ordering(
        query: Select<Self>,
        ordering_options: Option<OrderingOptions<Self::InputFields>>,
    ) -> Select<Self> {
        common_add_ordering(query, ordering_options)
    }
}

#[derive(Default)]
pub struct CellQuery;

#[Object]
impl CellQuery {
    async fn cells(
        &self,
        ctx: &Context<'_>,
        options: FetchOptions<CellFields>,
    ) -> Result<QueryResults<Model>> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");
        Entity::fetch(db, options).await
    }

    async fn paired_cells(
        &self,
        ctx: &Context<'_>,
        options: FetchOptions<CellFields, CellParity>,
    ) -> Result<QueryResults<Model>> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");

        let page_size = PageSize(calculate_page_size(options.page_size));
        let page: Page = options.page.into();

        let mut query = Entity::find();
        if let Some(data_group) = options.data_group_id {
            query = query.filter(Entity::get_data_group_column().eq(data_group));
        }
        query = Entity::add_ordering(query, options.ordering);
        query = Entity::add_filters(query, options.filters);
        if let Some(id_culture) = options.id.id_culture {
            query = query.filter(
                Condition::any().add(
                    Column::Id.in_subquery(
                        Query::select()
                            .column(super::cell_culture_pair::Column::IdCell)
                            .from(super::cell_culture_pair::Entity)
                            .and_where(super::cell_culture_pair::Column::IdCulture.eq(id_culture))
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

    async fn unpaired_cells(
        &self,
        ctx: &Context<'_>,
        options: FetchOptions<CellFields, CellParity>,
    ) -> Result<QueryResults<Model>> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");

        let page_size = PageSize(calculate_page_size(options.page_size));
        let page: Page = options.page.into();

        let mut query = Entity::find();
        if let Some(data_group) = options.data_group_id {
            query = query.filter(Entity::get_data_group_column().eq(data_group));
        }
        query = Entity::add_ordering(query, options.ordering);
        query = Entity::add_filters(query, options.filters);
        query = query.filter(
            Condition::any().add(
                Column::Id.not_in_subquery(
                    Query::select()
                        .column(super::cell_culture_pair::Column::IdCell)
                        .from(super::cell_culture_pair::Entity)
                        .and_where(
                            super::cell_culture_pair::Column::IdCulture.eq(options.id.id_culture),
                        )
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
pub struct CellMutation;

#[Object]
impl CellMutation {
    async fn insert_cell(&self, ctx: &Context<'_>, options: CellInsertOptions) -> Result<Model> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");
        Entity::insert_entity(db, options).await
    }

    async fn update_cell(&self, ctx: &Context<'_>, options: CellUpdateOptions) -> Result<Model> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");
        Entity::update_entity(db, options).await
    }

    async fn delete_cell(&self, ctx: &Context<'_>, options: DeleteOptions) -> Result<RowsDeleted> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");
        Entity::delete_entity(db, options).await
    }
}
