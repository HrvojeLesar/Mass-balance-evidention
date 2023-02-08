use graphql_client::GraphQLQuery;
use reqwest::Client;

use super::{DateTime, GRAPHQL_ENDPOINT};
use crate::errors::Result;

#[derive(GraphQLQuery)]
#[graphql(
    schema_path = "../schema.gql",
    query_path = "../gql/Entry.gql",
    response_derives = "Debug"
)]
pub struct GetAllEntries;

#[derive(GraphQLQuery)]
#[graphql(schema_path = "../schema.gql", query_path = "../gql/Entry.gql")]
pub struct InsertEntry;

pub async fn get_all_entries(
    client: &Client,
    data_group_id: i64,
) -> Result<graphql_client::Response<get_all_entries::ResponseData>> {
    let request_body = GetAllEntries::build_query(get_all_entries::Variables {
        options: get_all_entries::EntryFetchOptions {
            id: None,
            page_size: None,
            page: None,
            ordering: None,
            filters: None,
            data_group_id: Some(data_group_id),
        },
    });

    let res = client
        .post(GRAPHQL_ENDPOINT)
        .json(&request_body)
        .send()
        .await?;

    Ok(res
        .json::<graphql_client::Response<get_all_entries::ResponseData>>()
        .await?)
}
