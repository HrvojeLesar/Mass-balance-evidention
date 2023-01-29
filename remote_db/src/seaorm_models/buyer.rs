//! `SeaORM` Entity. Generated by sea-orm-codegen 0.10.7

use std::env;

use async_graphql::{Enum, InputObject, InputType, SimpleObject};
use async_trait::async_trait;
use sea_orm::{
    entity::prelude::*, ActiveValue, ConnectOptions, DatabaseTransaction, DeleteResult,
    ItemsAndPagesNumber, QueryOrder, TransactionTrait,
};
use serde::{Deserialize, Serialize};

use crate::models::{
    buyer::{BuyerFields, BuyerInsertOptions, BuyerUpdateOptions, BuyersNew},
    db_query::calc_limit,
    DeleteOptions, FetchOptions, FieldTypes, FilterNew, Pagination,
};

use anyhow::Result;

use super::{QueryDatabase, QueryResults, QueryResultsHelperType};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize, SimpleObject)]
#[sea_orm(table_name = "buyer")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    #[sea_orm(column_type = "Text", nullable)]
    pub name: Option<String>,
    #[sea_orm(column_type = "Text", nullable)]
    pub address: Option<String>,
    #[sea_orm(column_type = "Text", nullable)]
    pub contact: Option<String>,
    pub created_at: DateTimeWithTimeZone,
    pub d_group: Option<i32>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::data_group::Entity",
        from = "Column::DGroup",
        to = "super::data_group::Column::Id",
        on_update = "NoAction",
        on_delete = "NoAction"
    )]
    DataGroup,
    #[sea_orm(has_many = "super::entry::Entity")]
    Entry,
}

impl Related<super::data_group::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::DataGroup.def()
    }
}

impl Related<super::entry::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Entry.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}

// #[derive(Enum, Clone, Copy, PartialEq, Eq)]
// pub(super) enum BuyerField {
//     Id,
//     Name,
//     Address,
//     Contact,
// }

type BuyerFetchOptions = FetchOptions<BuyerFields>;

impl From<BuyerFields> for Column {
    fn from(fields: BuyerFields) -> Self {
        match fields {
            BuyerFields::Name => Column::Name,
            BuyerFields::Address => Column::Address,
            BuyerFields::Contact => Column::Contact,
        }
    }
}

#[derive(InputObject)]
pub struct BuyerUpdateOptionsNew {
    pub id: i32,
    pub name: Option<String>,
    pub address: Option<String>,
    pub contact: Option<String>,
}

#[derive(InputObject, Serialize, Deserialize)]
pub struct BuyerInsertOptionsNew {
    pub name: String,
    pub address: Option<String>,
    pub contact: Option<String>,
    pub d_group: Option<i32>,
}

#[async_trait]
impl QueryDatabase for Entity {
    type InnerQueryResultType = Model;

    type QueryResultType = QueryResults<Self::InnerQueryResultType>;

    type FetchModel = Model;

    type InsertOptions = BuyerInsertOptionsNew;

    type UpdateOptions = BuyerUpdateOptionsNew;

    async fn delete_query(
        transaction: &DatabaseTransaction,
        delete_options: DeleteOptions,
    ) -> Result<DeleteResult> {
        Ok(Self::delete_by_id(delete_options.id)
            .exec(transaction)
            .await?)
    }

    async fn update_entity(
        db: &DatabaseConnection,
        options: Self::UpdateOptions,
    ) -> Result<Self::InnerQueryResultType> {
        let model = ActiveModel {
            id: ActiveValue::Set(options.id),
            name: options
                .name
                .map_or(ActiveValue::NotSet, |val| ActiveValue::Set(Some(val))),
            address: options
                .address
                .map_or(ActiveValue::NotSet, |val| ActiveValue::Set(Some(val))),
            contact: options
                .contact
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
            name: ActiveValue::Set(Some(options.name)),
            address: ActiveValue::Set(options.address),
            contact: ActiveValue::Set(options.contact),
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
}

// impl ToQueryResults for Model {}

// impl Model {
//     pub async fn get(
//         db: &DatabaseConnection,
//         fetch_options: BuyerFetchOptions,
//     ) -> Result<BuyersNew> {
//         let mut query = Entity::find();
//         if let Some(ordering) = fetch_options.ordering {
//             query = query.order_by::<Column>(ordering.order_by.into(), ordering.order.into());
//         }
//         if let Some(filters) = fetch_options.filtersnew {
//             if !filters.is_empty() {
//                 for filter in filters.iter() {
//                     // TODO: if column is string based handle as search
//                     // if column is number handle lt, gt, eq...
//                     // if column is date handle range, exact date, before, after...
//                     query = Self::add_filter(query, &filter);
//                 }
//             }
//         }
//
//         let transaction = db.begin().await?;
//
//         let paginator = query.paginate(&transaction, calc_limit(fetch_options.page_size) as u64);
//         let res = paginator
//             .fetch_page(fetch_options.page.unwrap_or(0) as u64)
//             .await?;
//
//         let num_items_and_pages = paginator.num_items_and_pages().await?;
//
//         transaction.commit().await?;
//
//         Ok(BuyersNew {
//             results: res,
//             pagination: Pagination {
//                 page: fetch_options.page.unwrap_or_default(),
//                 page_size: fetch_options.page_size.unwrap_or_default(),
//                 total: num_items_and_pages.number_of_items as i64,
//             },
//         })
//     }
//
//     // TODO: make generic and rename
//     pub async fn insert_buyer(
//         db: &DatabaseConnection,
//         options: BuyerInsertOptions,
//     ) -> Result<Model> {
//         let model = ActiveModel {
//             name: ActiveValue::Set(Some(options.name)),
//             address: ActiveValue::Set(options.address),
//             contact: ActiveValue::Set(options.contact),
//             d_group: ActiveValue::Set(options.d_group),
//             ..Default::default()
//         };
//         let transaction = db.begin().await?;
//         let res = Entity::insert(model)
//             .exec_with_returning(&transaction)
//             .await?;
//         transaction.commit().await?;
//
//         Ok(res)
//     }
//
//     pub async fn update_buyer(
//         db: &DatabaseConnection,
//         options: BuyerUpdateOptions,
//     ) -> Result<Model> {
//         let model = ActiveModel {
//             id: ActiveValue::Set(options.id),
//             name: options
//                 .name
//                 .map_or(ActiveValue::NotSet, |val| ActiveValue::Set(Some(val))),
//             address: options
//                 .address
//                 .map_or(ActiveValue::NotSet, |val| ActiveValue::Set(Some(val))),
//             contact: options
//                 .contact
//                 .map_or(ActiveValue::NotSet, |val| ActiveValue::Set(Some(val))),
//             ..Default::default()
//         };
//         let transaction = db.begin().await?;
//         let res = Entity::update(model).exec(&transaction).await?;
//         transaction.commit().await?;
//
//         Ok(res)
//     }
//
//     pub async fn delete_buyer(db: &DatabaseConnection, options: DeleteOptions) -> Result<Model> {
//         let transaction = db.begin().await?;
//         let res = if let Some(entity) = Entity::find_by_id(options.id).one(&transaction).await? {
//             let _del_result = Entity::delete_by_id(options.id).exec(&transaction).await?;
//             entity
//         } else {
//             // TODO: Change error message
//             return Err(anyhow::anyhow!("Provided ID not found!"));
//         };
//         transaction.commit().await?;
//
//         Ok(res)
//     }
//
//     fn add_filter<T>(mut query: Select<Entity>, filter: &FilterNew<T>) -> Select<Entity>
//     where
//         T: InputType,
//     {
//         // let column: Column = filter.field.into();
//         match filter.field_type {
//             FieldTypes::String => {
//                 query = query.filter(Column::Name.contains(&filter.value));
//             }
//             FieldTypes::Number => {
//                 todo!();
//             }
//             FieldTypes::Date => {
//                 todo!();
//             }
//         }
//         return query;
//     }
// }
