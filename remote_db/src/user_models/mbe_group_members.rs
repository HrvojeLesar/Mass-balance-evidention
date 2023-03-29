use anyhow::{anyhow, Result};
use async_graphql::{Context, InputObject, Object, SimpleObject};
use sea_orm::{entity::prelude::*, ActiveValue, FromQueryResult, QuerySelect, TransactionTrait};
use serde::{Deserialize, Serialize};

use crate::{
    seaorm_models::{graphql_schema::extract_session, RowsDeleted},
    SeaOrmPool,
};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize, SimpleObject)]
#[sea_orm(table_name = "mbe_group_members")]
#[graphql(name = "MbeGroupMembers")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id_mbe_user: i32,
    #[sea_orm(primary_key, auto_increment = false)]
    pub id_mbe_group: i32,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::mbe_group::Entity",
        from = "Column::IdMbeGroup",
        to = "super::mbe_group::Column::Id",
        on_update = "NoAction",
        on_delete = "NoAction"
    )]
    MbeGroup,
    #[sea_orm(
        belongs_to = "super::mbe_user::Entity",
        from = "Column::IdMbeUser",
        to = "super::mbe_user::Column::Id",
        on_update = "NoAction",
        on_delete = "NoAction"
    )]
    MbeUser,
}

impl Related<super::mbe_group::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::MbeGroup.def()
    }
}

impl Related<super::mbe_user::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::MbeUser.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}

#[derive(InputObject)]
struct MbeGroupMembersQueryOptions {
    id_mbe_group: i32,
}

#[derive(InputObject)]
struct MbeGroupMembersOptions {
    id_mbe_group: i32,
    member_email: String,
}

#[derive(Debug, Clone, FromQueryResult, SimpleObject)]
struct MbeGroupMembersFlattened {
    id_user: i32,
    email: String,

    id_group: i32,
    group_name: String,
}

#[derive(Default)]
pub struct MbeGroupMembersQuery;

#[Object]
impl MbeGroupMembersQuery {
    async fn mbe_group_members(
        &self,
        ctx: &Context<'_>,
        options: MbeGroupMembersQueryOptions,
    ) -> Result<Vec<MbeGroupMembersFlattened>> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");
        let session_data = extract_session(ctx)?;

        let transaction = db.begin().await?;

        let res = if Entity::find()
            .filter(Column::IdMbeGroup.eq(options.id_mbe_group))
            .filter(Column::IdMbeUser.eq(session_data.user_id))
            .one(&transaction)
            .await?
            .is_some()
            || super::mbe_group::Entity::find()
                .filter(super::mbe_group::Column::Id.eq(options.id_mbe_group))
                .filter(super::mbe_group::Column::Owner.eq(session_data.user_id))
                .one(&transaction)
                .await?
                .is_some()
        {
            Entity::find()
                .filter(Column::IdMbeGroup.eq(options.id_mbe_group))
                .inner_join(super::mbe_user::Entity)
                .inner_join(super::mbe_group::Entity)
                .column_as(super::mbe_user::Column::Id, "id_user")
                .column_as(super::mbe_user::Column::Email, "email")
                .column_as(super::mbe_group::Column::Id, "id_group")
                .column_as(super::mbe_group::Column::Name, "group_name")
                .into_model::<MbeGroupMembersFlattened>()
                .all(&transaction)
                .await?
        } else {
            return Err(anyhow!("Unauthorized"));
        };

        transaction.commit().await?;

        Ok(res)
    }
}

#[derive(Default)]
pub struct MbeGroupMembersMutation;

#[Object]
impl MbeGroupMembersMutation {
    async fn insert_group_member(
        &self,
        ctx: &Context<'_>,
        options: MbeGroupMembersOptions,
    ) -> Result<Model> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");
        let session_data = extract_session(ctx)?;

        let transaction = db.begin().await?;

        let mbe_user = match super::mbe_user::Entity::find()
            .filter(super::mbe_user::Column::Email.eq(options.member_email))
            .one(&transaction)
            .await?
        {
            Some(user) => {
                if user.id != session_data.user_id {
                    user
                } else {
                    return Err(anyhow!("Cannot add yourself to group!"));
                }
            }
            None => return Err(anyhow!("User not found!")),
        };

        let mbe_group = super::mbe_group::Entity::find()
            .filter(super::mbe_group::Column::Id.eq(options.id_mbe_group))
            .one(&transaction)
            .await?
            .ok_or_else(|| anyhow!("Group not found"))?;

        let res = if mbe_group.owner == session_data.user_id
            || Entity::find()
                .filter(Column::IdMbeGroup.eq(mbe_group.id))
                .filter(Column::IdMbeUser.eq(session_data.user_id))
                .one(&transaction)
                .await?
                .is_some()
        {
            let model = ActiveModel {
                id_mbe_group: ActiveValue::Set(mbe_group.id),
                id_mbe_user: ActiveValue::Set(mbe_user.id),
            };

            Entity::insert(model)
                .exec_with_returning(&transaction)
                .await?
        } else {
            return Err(anyhow!("Not authorized to add to group!"));
        };

        transaction.commit().await?;

        Ok(res)
    }

    async fn remove_group_member(
        &self,
        ctx: &Context<'_>,
        options: MbeGroupMembersOptions,
    ) -> Result<RowsDeleted> {
        let db = ctx.data::<SeaOrmPool>().expect("Pool must exist");
        let session_data = extract_session(ctx)?;

        let transaction = db.begin().await?;

        let mbe_user = match super::mbe_user::Entity::find()
            .filter(super::mbe_user::Column::Email.eq(options.member_email))
            .one(&transaction)
            .await?
        {
            Some(user) => user,
            None => return Err(anyhow!("User not found!")),
        };

        let mbe_group = super::mbe_group::Entity::find()
            .filter(super::mbe_group::Column::Id.eq(options.id_mbe_group))
            .one(&transaction)
            .await?
            .ok_or_else(|| anyhow!("Group not found"))?;

        // TODO: Add permissions
        // TODO: Currently all group members can remove eachother
        let res = if mbe_group.owner == session_data.user_id
            || Entity::find()
                .filter(Column::IdMbeGroup.eq(mbe_group.id))
                .filter(Column::IdMbeUser.eq(session_data.user_id))
                .one(&transaction)
                .await?
                .is_some()
        {
            let model = ActiveModel {
                id_mbe_group: ActiveValue::Set(mbe_group.id),
                id_mbe_user: ActiveValue::Set(mbe_user.id),
            };

            Entity::delete(model).exec(&transaction).await?
        } else {
            return Err(anyhow!("Not authorized to remove from group!"));
        };

        transaction.commit().await?;

        Ok(res.into())
    }
}
