use async_graphql::{Context, Enum, InputObject, Object, SimpleObject};
use async_trait::async_trait;
use log::error;
use sea_orm::{
    entity::prelude::*,
    sea_query::{Expr, Func},
    ActiveValue, DatabaseTransaction, DeleteResult, FromQueryResult, JoinType, Order, QueryOrder,
    QuerySelect, TransactionTrait,
};
use serde::{Deserialize, Serialize};

use anyhow::anyhow;
use anyhow::Result;

use crate::SeaOrmPool;

use super::{
    graphql_schema::{
        DataGroupAccessGuard, DeleteOptions, FetchOptions, Filter, OrderingOptions, Pagination,
        UpdateDeleteGuard,
    },
    GetEntityDataGroupColumnTrait, GetEntityDataGroupId, GetEntityId, QueryDatabase, QueryResults,
    QueryResultsHelperType, RowsDeleted,
};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize, SimpleObject)]
#[sea_orm(table_name = "entry")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub weight: Option<f64>,
    pub date: Date,
    pub created_at: DateTimeWithTimeZone,
    pub id_buyer: i32,
    pub id_cell_culture_pair: i32,
    pub d_group: i32,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::buyer::Entity",
        from = "Column::IdBuyer",
        to = "super::buyer::Column::Id",
        on_update = "NoAction",
        on_delete = "NoAction"
    )]
    Buyer,
    #[sea_orm(
        belongs_to = "super::cell_culture_pair::Entity",
        from = "Column::IdCellCulturePair",
        to = "super::cell_culture_pair::Column::Id",
        on_update = "NoAction",
        on_delete = "NoAction"
    )]
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

impl Related<super::buyer::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Buyer.def()
    }
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

#[allow(clippy::derivable_impls)]
impl Default for Column {
    fn default() -> Self {
        Self::Id
    }
}

#[derive(InputObject)]
pub struct EntryInsertOptions {
    pub date: DateTimeWithTimeZone,
    pub weight: Option<f64>,
    pub id_buyer: i32,
    pub id_cell: i32,
    pub id_culture: i32,
    pub d_group: i32,
}

#[derive(InputObject)]
pub struct PairIds {
    id_cell: i32,
    id_culture: i32,
}

#[derive(InputObject)]
pub struct EntryUpdateOptions {
    pub id: i32,
    pub weight: Option<f64>,
    pub date: Option<DateTimeWithTimeZone>,
    pub id_buyer: Option<i32>,
    pub pair_ids: Option<PairIds>,
    pub d_group: Option<i32>,
}

#[derive(Enum, Clone, Copy, PartialEq, Eq)]
pub enum EntryFields {
    Id,
    Weight,
    Date,
    BuyerName,
    BuyerAddress,
    BuyerContact,
    CellName,
    CellDescription,
    CultureName,
    CultureDescription,
}

#[derive(Debug, Clone, FromQueryResult)]
pub struct EntryFlattened {
    pub id: i32,
    pub weight: Option<f64>,
    pub date: Date,
    pub created_at: DateTimeWithTimeZone,
    pub d_group: i32,

    pub id_buyer: i32,
    pub name_buyer: Option<String>,
    pub address_buyer: Option<String>,
    pub contact_buyer: Option<String>,
    pub created_at_buyer: DateTimeWithTimeZone,
    pub d_group_buyer: i32,

    pub id_cell: i32,
    pub name_cell: String,
    pub description_cell: Option<String>,
    pub created_at_cell: DateTimeWithTimeZone,
    pub d_group_cell: i32,

    pub id_culture: i32,
    pub name_culture: String,
    pub description_culture: Option<String>,
    pub created_at_culture: DateTimeWithTimeZone,
    pub d_group_culture: i32,

    pub id_d_group: i32,
    pub name_d_group: String,
    pub description_d_group: Option<String>,
    pub created_at_d_group: DateTimeWithTimeZone,
    pub id_mbe_group: i32,

    // pub id_weight_type: i32,
    // pub unit_short: String,
    // pub unit: String,
    // pub created_at_weight_type: DateTimeWithTimeZone,
}

#[derive(Debug, SimpleObject)]
pub struct Entry {
    pub id: i32,
    pub weight: Option<f64>,
    pub date: Date,
    pub created_at: DateTimeWithTimeZone,

    pub buyer: super::buyer::Model,
    pub cell: super::cell::Model,
    pub culture: super::culture::Model,
    // pub weight_type: super::weight_type::Model,
    pub d_group: super::data_group::Model,
}

#[derive(Debug, SimpleObject)]
pub struct AllEntires {
    results: Vec<Entry>,
    total: u64,
}

impl From<QueryResultsHelperType<EntryFlattened>> for QueryResults<Entry> {
    fn from(inp: QueryResultsHelperType<EntryFlattened>) -> Self {
        let (results, items_and_page_number, page, page_size) = inp;
        Self {
            results: results
                .into_iter()
                .map(|flat| Entry {
                    id: flat.id,
                    weight: flat.weight,
                    date: flat.date,
                    created_at: flat.created_at,
                    buyer: super::buyer::Model {
                        id: flat.id_buyer,
                        name: flat.name_buyer,
                        address: flat.address_buyer,
                        contact: flat.contact_buyer,
                        created_at: flat.created_at_buyer,
                        d_group: flat.d_group_buyer,
                    },
                    cell: super::cell::Model {
                        id: flat.id_cell,
                        name: flat.name_cell,
                        description: flat.description_cell,
                        created_at: flat.created_at_cell,
                        d_group: flat.d_group_cell,
                    },
                    culture: super::culture::Model {
                        id: flat.id_culture,
                        name: flat.name_culture,
                        description: flat.description_culture,
                        created_at: flat.created_at_culture,
                        d_group: flat.d_group_culture,
                    },
                    // weight_type: super::weight_type::Model {
                    //     id: flat.id_weight_type,
                    //     unit_short: flat.unit_short,
                    //     unit: flat.unit,
                    //     created_at: flat.created_at_weight_type,
                    // },
                    d_group: super::data_group::Model {
                        id: flat.id_d_group,
                        name: flat.name_d_group,
                        description: flat.description_d_group,
                        created_at: flat.created_at_d_group,
                        id_mbe_group: flat.id_mbe_group,
                    },
                })
                .collect(),
            pagination: Pagination {
                page: page.page,
                page_size: page_size.0,
                total_items: items_and_page_number.number_of_items,
                total_pages: items_and_page_number.number_of_pages,
            },
        }
    }
}

impl GetEntityDataGroupColumnTrait<Column> for Entity {
    fn get_data_group_column() -> Column {
        Column::DGroup
    }
}

#[async_trait]
impl QueryDatabase for Entity {
    type InnerQueryResultType = Entry;

    type QueryResultType = QueryResults<Self::InnerQueryResultType>;

    type FetchModel = EntryFlattened;

    type InsertOptions = EntryInsertOptions;

    type UpdateOptions = EntryUpdateOptions;

    type InputFields = EntryFields;

    type DeleteOptionsType = i32;

    type FetchIdType = Option<i32>;

    type FilterValueType = String;

    fn get_query() -> Select<Self> {
        Entity::find()
            .inner_join(super::buyer::Entity)
            .inner_join(super::cell_culture_pair::Entity)
            .inner_join(super::data_group::Entity)
            .join(
                JoinType::InnerJoin,
                super::cell_culture_pair::Relation::Culture.def(),
            )
            .join(
                JoinType::InnerJoin,
                super::cell_culture_pair::Relation::Cell.def(),
            )
            .column_as(super::buyer::Column::Id, "id_buyer")
            .column_as(super::buyer::Column::Name, "name_buyer")
            .column_as(super::buyer::Column::Address, "address_buyer")
            .column_as(super::buyer::Column::Contact, "contact_buyer")
            .column_as(super::buyer::Column::CreatedAt, "created_at_buyer")
            .column_as(super::buyer::Column::DGroup, "d_group_buyer")
            .column_as(super::cell::Column::Id, "id_cell")
            .column_as(super::cell::Column::Name, "name_cell")
            .column_as(super::cell::Column::Description, "description_cell")
            .column_as(super::cell::Column::CreatedAt, "created_at_cell")
            .column_as(super::cell::Column::DGroup, "d_group_cell")
            .column_as(super::culture::Column::Id, "id_culture")
            .column_as(super::culture::Column::Name, "name_culture")
            .column_as(super::culture::Column::Description, "description_culture")
            .column_as(super::culture::Column::CreatedAt, "created_at_culture")
            .column_as(super::culture::Column::DGroup, "d_group_culture")
            .column_as(super::data_group::Column::Id, "id_d_group")
            .column_as(super::data_group::Column::Name, "name_d_group")
            .column_as(
                super::data_group::Column::Description,
                "description_d_group",
            )
            .column_as(super::data_group::Column::CreatedAt, "created_at_d_group")
            .column_as(super::data_group::Column::IdMbeGroup, "id_mbe_group")
    }

    async fn delete_query(
        transaction: &DatabaseTransaction,
        options: DeleteOptions<Self::DeleteOptionsType>,
    ) -> Result<DeleteResult> {
        Ok(Self::delete_by_id(options.id).exec(transaction).await?)
    }

    fn add_ordering(
        mut query: Select<Self>,
        ordering_options: Option<OrderingOptions<Self::InputFields>>,
    ) -> Select<Self> {
        match ordering_options {
            Some(options) => {
                let order = options.order.into();
                query = match options.order_by {
                    Self::InputFields::Id => query.order_by(Column::Id, order),
                    Self::InputFields::Weight => query.order_by(Column::Weight, order),
                    Self::InputFields::Date => query.order_by(Column::Date, order),
                    Self::InputFields::BuyerName => {
                        query.order_by(super::buyer::Column::Name, order)
                    }
                    Self::InputFields::BuyerAddress => {
                        query.order_by(super::buyer::Column::Address, order)
                    }
                    Self::InputFields::BuyerContact => {
                        query.order_by(super::buyer::Column::Contact, order)
                    }
                    Self::InputFields::CellName => query.order_by(super::cell::Column::Name, order),
                    Self::InputFields::CellDescription => {
                        query.order_by(super::cell::Column::Description, order)
                    }
                    Self::InputFields::CultureName => {
                        query.order_by(super::culture::Column::Name, order)
                    }
                    Self::InputFields::CultureDescription => {
                        query.order_by(super::culture::Column::Description, order)
                    }
                };
            }
            None => {
                query = query.order_by(super::cell::Column::Name, Order::Asc);
            }
        }
        query
    }

    fn add_id_and_data_group_filters(
        mut query: Select<Self>,
        fetch_options: &FetchOptions<Self::InputFields, Self::FetchIdType>,
    ) -> Select<Self> {
        if let Some(id) = &fetch_options.id {
            query = query.filter(Column::Id.eq(*id))
        }
        query = query.filter(Column::DGroup.eq(fetch_options.d_group));
        query
    }

    // WARN: Operation not really used, frontend gets all entries and does filtering, sorting...
    fn add_filter(mut query: Select<Self>, filter: Filter<Self::InputFields>) -> Select<Self> {
        match filter.field {
            Self::InputFields::BuyerName => query.filter(
                Expr::expr(Func::lower(Expr::col((
                    super::buyer::Entity,
                    super::buyer::Column::Name,
                ))))
                .like(format!("%{}%", filter.value.trim().to_lowercase())),
            ),
            Self::InputFields::BuyerAddress => query.filter(
                Expr::expr(Func::lower(Expr::col((
                    super::buyer::Entity,
                    super::buyer::Column::Address,
                ))))
                .like(format!("%{}%", filter.value.trim().to_lowercase())),
            ),
            Self::InputFields::BuyerContact => query.filter(
                Expr::expr(Func::lower(Expr::col((
                    super::buyer::Entity,
                    super::buyer::Column::Contact,
                ))))
                .like(format!("%{}%", filter.value.trim().to_lowercase())),
            ),
            Self::InputFields::CellName => query.filter(
                Expr::expr(Func::lower(Expr::col((
                    super::cell::Entity,
                    super::cell::Column::Name,
                ))))
                .like(format!("%{}%", filter.value.trim().to_lowercase())),
            ),
            Self::InputFields::CellDescription => query.filter(
                Expr::expr(Func::lower(Expr::col((
                    super::cell::Entity,
                    super::cell::Column::Description,
                ))))
                .like(format!("%{}%", filter.value.trim().to_lowercase())),
            ),
            Self::InputFields::CultureName => query.filter(
                Expr::expr(Func::lower(Expr::col((
                    super::culture::Entity,
                    super::culture::Column::Name,
                ))))
                .like(format!("%{}%", filter.value.trim().to_lowercase())),
            ),
            Self::InputFields::CultureDescription => query.filter(
                Expr::expr(Func::lower(Expr::col((
                    super::culture::Entity,
                    super::culture::Column::Description,
                ))))
                .like(format!("%{}%", filter.value.trim().to_lowercase())),
            ),
            // TODO: Other operations on weight like less than, more than...
            Self::InputFields::Id | Self::InputFields::Weight => {
                query = match filter.value.parse::<i32>() {
                    Ok(val) => match filter.field {
                        Self::InputFields::Id => query.filter(Column::Id.eq(val)),
                        Self::InputFields::Weight => query.filter(Column::Weight.eq(val)),
                        _ => query,
                    },
                    Err(e) => {
                        error!("Inputed field value for Number is not a number, ignoring filter option: {:#?}", e);
                        query
                    }
                };
                query
            }
            // TODO: Proper date filtering
            Self::InputFields::Date => query,
        }
    }

    async fn update_entity(
        db: &DatabaseConnection,
        options: Self::UpdateOptions,
    ) -> Result<Self::InnerQueryResultType> {
        let transaction = db.begin().await?;

        let pair = match options.pair_ids {
            Some(pair) => {
                super::cell_culture_pair::Entity::find()
                    .filter(super::cell_culture_pair::Column::IdCell.eq(pair.id_cell))
                    .filter(super::cell_culture_pair::Column::IdCulture.eq(pair.id_culture))
                    .one(&transaction)
                    .await?
            }
            None => None,
        };

        let model = ActiveModel {
            id: ActiveValue::Set(options.id),
            weight: options
                .weight
                .map_or(ActiveValue::NotSet, |val| ActiveValue::Set(Some(val))),
            // weight_type: options
            //     .weight_type
            //     .map_or(ActiveValue::NotSet, ActiveValue::Set),
            date: options.date.map_or(ActiveValue::NotSet, |val| {
                ActiveValue::Set(val.date_naive())
            }),
            id_buyer: options
                .id_buyer
                .map_or(ActiveValue::NotSet, ActiveValue::Set),
            id_cell_culture_pair: pair.map_or(ActiveValue::NotSet, |val| ActiveValue::Set(val.id)),
            ..Default::default()
        };
        let res = Entity::update(model).exec(&transaction).await?;

        transaction.commit().await?;

        Ok(Self::fetch(
            db,
            FetchOptions::<EntryFields> {
                id: Some(res.id),
                page_size: None,
                page: None,
                ordering: None,
                filters: None,
                d_group: res.d_group,
            },
        )
        .await?
        .results
        .into_iter()
        .enumerate()
        .find(|(i, _)| *i == 0)
        .ok_or_else(|| anyhow!("Updated CellCulturePair not found"))?
        .1)
    }

    async fn insert_entity(
        db: &DatabaseConnection,
        options: Self::InsertOptions,
    ) -> Result<Self::InnerQueryResultType> {
        let transaction = db.begin().await?;

        let cell_culture_pair = super::cell_culture_pair::Entity::find()
            .filter(super::cell_culture_pair::Column::IdCell.eq(options.id_cell))
            .filter(super::cell_culture_pair::Column::IdCulture.eq(options.id_culture))
            .one(&transaction)
            .await?
            .ok_or_else(|| anyhow!("CellCulturePair with provided ids must exist!"))?;

        let model = ActiveModel {
            date: ActiveValue::Set(options.date.date_naive()),
            weight: ActiveValue::Set(options.weight),
            // weight_type: ActiveValue::Set(options.weight_type),
            id_buyer: ActiveValue::Set(options.id_buyer),
            id_cell_culture_pair: ActiveValue::Set(cell_culture_pair.id),
            d_group: ActiveValue::Set(options.d_group),
            ..Default::default()
        };
        let res = Entity::insert(model)
            .exec_with_returning(&transaction)
            .await?;

        transaction.commit().await?;

        Ok(Self::fetch(
            db,
            FetchOptions::<EntryFields> {
                id: Some(res.id),
                page_size: None,
                page: None,
                ordering: None,
                filters: None,
                d_group: res.d_group,
            },
        )
        .await?
        .results
        .into_iter()
        .enumerate()
        .find(|(i, _)| *i == 0)
        .ok_or_else(|| anyhow!("Updated CellCulturePair not found"))?
        .1)
    }
}

#[derive(Default)]
pub struct EntryQuery;

#[Object]
impl EntryQuery {
    #[graphql(guard = "DataGroupAccessGuard::new(options.d_group)")]
    async fn entries(
        &self,
        ctx: &Context<'_>,
        options: FetchOptions<EntryFields>,
    ) -> Result<QueryResults<Entry>> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");
        Entity::fetch(db, options).await
    }

    #[graphql(guard = "DataGroupAccessGuard::new(options.d_group)")]
    async fn all_entries(
        &self,
        ctx: &Context<'_>,
        options: FetchOptions<EntryFields>,
    ) -> Result<AllEntires> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");

        let mut query = Entity::get_query();

        query = Entity::add_id_and_data_group_filters(query, &options);
        query = Entity::add_ordering(query, options.ordering);
        query = Entity::add_filters(query, options.filters);

        let transaction = db.begin().await?;

        let res = query
            .into_model::<<Entity as QueryDatabase>::FetchModel>()
            .all(&transaction)
            .await?;

        transaction.commit().await?;

        Ok(AllEntires {
            total: res.len() as u64,
            results: res
                .into_iter()
                .map(|flat| Entry {
                    id: flat.id,
                    weight: flat.weight,
                    date: flat.date,
                    created_at: flat.created_at,
                    buyer: super::buyer::Model {
                        id: flat.id_buyer,
                        name: flat.name_buyer,
                        address: flat.address_buyer,
                        contact: flat.contact_buyer,
                        created_at: flat.created_at_buyer,
                        d_group: flat.d_group_buyer,
                    },
                    cell: super::cell::Model {
                        id: flat.id_cell,
                        name: flat.name_cell,
                        description: flat.description_cell,
                        created_at: flat.created_at_cell,
                        d_group: flat.d_group_cell,
                    },
                    culture: super::culture::Model {
                        id: flat.id_culture,
                        name: flat.name_culture,
                        description: flat.description_culture,
                        created_at: flat.created_at_culture,
                        d_group: flat.d_group_culture,
                    },
                    // weight_type: super::weight_type::Model {
                    //     id: flat.id_weight_type,
                    //     unit_short: flat.unit_short,
                    //     unit: flat.unit,
                    //     created_at: flat.created_at_weight_type,
                    // },
                    d_group: super::data_group::Model {
                        id: flat.id_d_group,
                        name: flat.name_d_group,
                        description: flat.description_d_group,
                        created_at: flat.created_at_d_group,
                        id_mbe_group: flat.id,
                    },
                })
                .collect(),
        })
    }
}

#[derive(Default)]
pub struct EntryMutation;

#[Object]
impl EntryMutation {
    #[graphql(guard = "DataGroupAccessGuard::new(options.d_group)")]
    async fn insert_entry(&self, ctx: &Context<'_>, options: EntryInsertOptions) -> Result<Entry> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");
        Entity::insert_entity(db, options).await
    }

    #[graphql(guard = "UpdateDeleteGuard::<Entity>::new(options.id)")]
    async fn update_entry(&self, ctx: &Context<'_>, options: EntryUpdateOptions) -> Result<Entry> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");
        Entity::update_entity(db, options).await
    }

    #[graphql(guard = "UpdateDeleteGuard::<Entity>::new(options.id)")]
    async fn delete_entry(&self, ctx: &Context<'_>, options: DeleteOptions) -> Result<RowsDeleted> {
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
