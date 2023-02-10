use async_graphql::{Context, Enum, InputObject, Object, SimpleObject};
use async_trait::async_trait;
use sea_orm::{
    entity::prelude::*, ActiveValue, DatabaseTransaction, DeleteResult, TransactionTrait,
};
use serde::{Deserialize, Serialize};

use crate::SeaOrmPool;

use super::{
    common_add_filter, common_add_id_and_data_group_filters, common_add_ordering,
    graphql_schema::{DeleteOptions, FetchOptions, Filter, OrderingOptions},
    GetDataGroupColumnTrait, QueryDatabase, QueryResults, RowsDeleted,
};

use anyhow::Result;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize, SimpleObject)]
#[sea_orm(table_name = "dispatch_note")]
#[graphql(name = "Dispatch_note")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub note_type: Option<i32>,
    pub numerical_identifier: Option<i32>,
    pub issuing_date: Option<DateTimeWithTimeZone>,
    pub d_group: i32,
    pub created_at: DateTimeWithTimeZone,
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
    #[sea_orm(has_many = "super::dispatch_note_article::Entity")]
    DispatchNoteArticle,
}

impl Related<super::data_group::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::DataGroup.def()
    }
}

impl Related<super::dispatch_note_article::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::DispatchNoteArticle.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}

#[derive(Enum, Clone, Copy, PartialEq, Eq)]
pub enum DispatchNoteFields {
    Id,
    NoteType,
    NumericalIdentifier,
    IssuingDate,
}

impl From<DispatchNoteFields> for Column {
    fn from(fields: DispatchNoteFields) -> Self {
        match fields {
            DispatchNoteFields::Id => Column::Id,
            DispatchNoteFields::NoteType => Column::NoteType,
            DispatchNoteFields::NumericalIdentifier => Column::NumericalIdentifier,
            DispatchNoteFields::IssuingDate => Column::IssuingDate,
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
pub struct DispatchNoteUpdateOptions {
    pub id: i32,
    pub note_type: Option<i32>,
    pub numerical_identifier: Option<i32>,
    pub issuing_date: Option<DateTimeWithTimeZone>,
}

#[derive(InputObject, Serialize, Deserialize)]
pub struct DispatchNoteInsertOptions {
    pub note_type: Option<i32>,
    pub numerical_identifier: Option<i32>,
    pub issuing_date: Option<DateTimeWithTimeZone>,
    pub d_group: i32,
}

#[async_trait]
impl QueryDatabase for Entity {
    type InnerQueryResultType = Model;

    type QueryResultType = QueryResults<Self::InnerQueryResultType>;

    type FetchModel = Model;

    type InsertOptions = DispatchNoteInsertOptions;

    type UpdateOptions = DispatchNoteUpdateOptions;

    type InputFields = DispatchNoteFields;

    type DeleteOptionsType = i32;

    type FetchIdType = Option<i32>;

    async fn delete_query(
        transaction: &DatabaseTransaction,
        options: DeleteOptions<Self::DeleteOptionsType>,
    ) -> Result<DeleteResult> {
        Ok(Self::delete_by_id(options.id).exec(transaction).await?)
    }

    fn add_ordering(
        query: Select<Self>,
        ordering_options: Option<OrderingOptions<Self::InputFields>>,
    ) -> Select<Self> {
        common_add_ordering(query, ordering_options)
    }

    fn add_id_and_data_group_filters(
        query: Select<Self>,
        fetch_options: &FetchOptions<Self::InputFields, Self::FetchIdType>,
    ) -> Select<Self> {
        common_add_id_and_data_group_filters(query, fetch_options)
    }

    fn add_filter(query: Select<Self>, filter: Filter<Self::InputFields>) -> Select<Self> {
        common_add_filter(query, filter)
    }

    async fn update_entity(
        db: &DatabaseConnection,
        options: Self::UpdateOptions,
    ) -> Result<Self::InnerQueryResultType> {
        let model = ActiveModel {
            id: ActiveValue::Set(options.id),
            note_type: options
                .note_type
                .map_or(ActiveValue::NotSet, |val| ActiveValue::Set(Some(val))),
            numerical_identifier: options
                .numerical_identifier
                .map_or(ActiveValue::NotSet, |val| ActiveValue::Set(Some(val))),
            issuing_date: options
                .issuing_date
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
            note_type: ActiveValue::Set(options.note_type),
            numerical_identifier: ActiveValue::Set(options.numerical_identifier),
            issuing_date: ActiveValue::Set(options.issuing_date),
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

#[derive(Default)]
pub struct DispatchNoteQuery;

#[Object]
impl DispatchNoteQuery {
    async fn dispatch_notes(
        &self,
        ctx: &Context<'_>,
        options: FetchOptions<DispatchNoteFields>,
    ) -> Result<QueryResults<Model>> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");
        Entity::fetch(db, options).await
    }
}

#[derive(Default)]
pub struct DispatchNoteMutation;

#[Object]
impl DispatchNoteMutation {
    async fn insert_dispatch_note(
        &self,
        ctx: &Context<'_>,
        options: DispatchNoteInsertOptions,
    ) -> Result<Model> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");
        Entity::insert_entity(db, options).await
    }

    async fn update_dispatch_note(
        &self,
        ctx: &Context<'_>,
        options: DispatchNoteUpdateOptions,
    ) -> Result<Model> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");
        Entity::update_entity(db, options).await
    }

    async fn delete_dispatch_note(
        &self,
        ctx: &Context<'_>,
        options: DeleteOptions,
    ) -> Result<RowsDeleted> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");
        Entity::delete_entity(db, options).await
    }
}
