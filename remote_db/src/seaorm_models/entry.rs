use async_graphql::{Enum, SimpleObject};
use async_trait::async_trait;
use sea_orm::{
    entity::prelude::*, DatabaseTransaction, DeleteResult, FromQueryResult, ItemsAndPagesNumber,
    JoinType, QuerySelect,
};
use serde::{Deserialize, Serialize};

use anyhow::Result;

use crate::models::{buyer::BuyerFields, DeleteOptions, FetchOptionsNew};

use super::{QueryDatabase, QueryResults, QueryResultsHelperType, QueryResultsTrait};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize, SimpleObject)]
#[sea_orm(table_name = "entry")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub weight: Option<f64>,
    pub weight_type: Option<String>,
    pub date: DateTimeWithTimeZone,
    pub created_at: DateTimeWithTimeZone,
    pub id_buyer: Option<i32>,
    pub id_cell: i32,
    pub id_culture: i32,
    pub d_group: Option<i32>,
    pub ccp_d_group: i32,
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
        from = "(Column::IdCell, Column::IdCulture)",
        to = "(super::cell_culture_pair::Column::IdCell, super::cell_culture_pair::Column::IdCulture)",
        on_update = "Cascade",
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
    #[sea_orm(
        belongs_to = "super::weight_types::Entity",
        from = "Column::WeightType",
        to = "super::weight_types::Column::Id",
        on_update = "NoAction",
        on_delete = "NoAction"
    )]
    WeightTypes,
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

impl Related<super::weight_types::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::WeightTypes.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}

#[derive(Debug, Clone, FromQueryResult)]
pub struct EntityWhole {
    id_buyer: i32,
    name_buyer: Option<String>,
    address_buyer: Option<String>,
    contact_buyer: Option<String>,
    created_at_buyer: DateTimeWithTimeZone,
    d_group_buyer: Option<i32>,
    id_cell: i32,
    name_cell: String,
    description_cell: Option<String>,
    created_at_cell: DateTimeWithTimeZone,
    d_group_cell: Option<i32>,
    id_culture: i32,
    name_culture: String,
    description_culture: Option<String>,
    created_at_culture: DateTimeWithTimeZone,
    d_group_culture: Option<i32>,
    id_d_group: i32,
    name_d_group: String,
    description_d_group: Option<String>,
    created_at_d_group: DateTimeWithTimeZone,
    id: i32,
    weight: Option<f64>,
    weight_type: Option<String>,
    date: DateTimeWithTimeZone,
    created_at: DateTimeWithTimeZone,
    d_group: Option<i32>,
    ccp_d_group: i32,
}

// impl ToQueryResults<Model> for EntityWhole {}

// impl ToQueryResults<Model> for <Entity as EntityTrait>::Model {}

#[derive(Debug, SimpleObject)]
pub struct TestStruct {
    kekec: i32,
}

impl From<QueryResultsHelperType<EntityWhole>> for QueryResults<TestStruct> {
    fn from(inp: QueryResultsHelperType<EntityWhole>) -> Self {
        Self {
            results: inp
                .0
                .into_iter()
                .map(|a| TestStruct { kekec: a.id_cell })
                .collect(),
            pagination: crate::models::PaginationNew {
                page: 0,
                page_size: 0,
                total_items: inp.1.number_of_items,
                total_pages: inp.1.number_of_pages,
            },
        }
    }
}

#[async_trait]
impl QueryDatabase for Entity {
    type InnerQueryResultType = TestStruct;

    type QueryResultType = QueryResults<Self::InnerQueryResultType>;

    type FetchModel = EntityWhole;

    type InsertOptions = i32;

    type UpdateOptions = i32;

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
            .column_as(super::buyer::Column::Name, "name_buyer")
            .column_as(super::buyer::Column::Address, "address_buyer")
            .column_as(super::buyer::Column::Contact, "contact_buyer")
            .column_as(super::buyer::Column::CreatedAt, "created_at_buyer")
            .column_as(super::buyer::Column::DGroup, "d_group_buyer")
            .column_as(super::cell::Column::Name, "name_cell")
            .column_as(super::cell::Column::Description, "description_cell")
            .column_as(super::cell::Column::CreatedAt, "created_at_cell")
            .column_as(super::cell::Column::DGroup, "d_group_cell")
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
        // .into_model::<Model>();
        // <Self as EntityTrait>::find()
    }

    async fn update_entity(
        db: &DatabaseConnection,
        update_options: Self::UpdateOptions,
    ) -> Result<Self::InnerQueryResultType> {
        todo!()
    }

    async fn delete_query(
        transaction: &DatabaseTransaction,
        delete_options: DeleteOptions,
    ) -> Result<DeleteResult> {
        Ok(Self::delete_by_id(delete_options.id)
            .exec(transaction)
            .await?)
    }

    async fn insert_entity(
        db: &DatabaseConnection,
        options: Self::InsertOptions,
    ) -> Result<Self::InnerQueryResultType> {
        todo!()
    }
}

#[derive(Enum, Clone, Copy, PartialEq, Eq)]
pub enum EntryFieldsNew {
    Name,
}

pub type EntryFetchOptionsNew = FetchOptionsNew<EntryFieldsNew>;
pub type BuyerFetchOptionsNew = FetchOptionsNew<BuyerFields>;

impl From<EntryFieldsNew> for Column {
    fn from(fields: EntryFieldsNew) -> Self {
        match fields {
            EntryFieldsNew::Name => Column::Id,
        }
    }
}

pub async fn t(db: &DatabaseConnection) {
    println!(
        "{:#?}",
        super::buyer::Entity::fetch(
            db,
            BuyerFetchOptionsNew {
                id: Some(2),
                page_size: None,
                page: None,
                ordering: None,
                filtersnew: None,
                data_group_id: None,
            },
        )
        .await
        .unwrap()
    );
    // println!(
    //     "{:#?}",
    //     Entity::fetch(
    //         db,
    //         EntryFetchOptionsNew {
    //             id: None,
    //             page_size: None,
    //             page: None,
    //             ordering: None,
    //             filtersnew: None,
    //             data_group_id: None,
    //         },
    //     )
    //     .await
    //     .unwrap()
    // );
    // let t = Entity::find().all(db).await.unwrap();
    // println!(
    //     "{:#?}",
    //     Entity::find()
    //         .inner_join(super::buyer::Entity)
    //         .inner_join(super::cell_culture_pair::Entity)
    //         .inner_join(super::data_group::Entity)
    //         .join(
    //             JoinType::InnerJoin,
    //             super::cell_culture_pair::Relation::Culture.def()
    //         )
    //         .join(
    //             JoinType::InnerJoin,
    //             super::cell_culture_pair::Relation::Cell.def()
    //         )
    //         .column_as(super::buyer::Column::Name, "name_buyer")
    //         .column_as(super::buyer::Column::Address, "address_buyer")
    //         .column_as(super::buyer::Column::Contact, "contact_buyer")
    //         .column_as(super::buyer::Column::CreatedAt, "created_at_buyer")
    //         .column_as(super::buyer::Column::DGroup, "d_group_buyer")
    //         .column_as(super::cell::Column::Name, "name_cell")
    //         .column_as(super::cell::Column::Description, "description_cell")
    //         .column_as(super::cell::Column::CreatedAt, "created_at_cell")
    //         .column_as(super::cell::Column::DGroup, "d_group_cell")
    //         .column_as(super::culture::Column::Name, "name_culture")
    //         .column_as(super::culture::Column::Description, "description_culture")
    //         .column_as(super::culture::Column::CreatedAt, "created_at_culture")
    //         .column_as(super::culture::Column::DGroup, "d_group_culture")
    //         .column_as(super::data_group::Column::Id, "id_d_group")
    //         .column_as(super::data_group::Column::Name, "name_d_group")
    //         .column_as(
    //             super::data_group::Column::Description,
    //             "description_d_group"
    //         )
    //         .column_as(super::data_group::Column::CreatedAt, "created_at_d_group")
    //         .into_model::<EntityWhole>()
    //         .all(db)
    //         .await
    //         .unwrap()
    // );
    // println!(
    //     "{:#?}",
    //     Entity::find()
    //         .join(JoinType::LeftJoin, Relation::Buyer.def())
    //         .all(db)
    //         .await
    //         .unwrap()
    // );
    // if let Some(first) = t.first() {
    //     println!(
    //         "{:#?}",
    //         first
    //             .find_related(super::buyer::Entity)
    //             .all(db)
    //             .await
    //             .unwrap()
    //     );
    //     // .find_related(super::cell_culture_pair::Entity)
    //     // .find_related(super::data_group::Entity)
    //     // .find_related(super::cell::Entity)
    //     // .find_related(super::culture::Entity);
    // }
    // println!("{:#?}", t);
}
