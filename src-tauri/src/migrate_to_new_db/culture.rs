use graphql_client::GraphQLQuery;
use reqwest::Client;

use super::{DateTime, GRAPHQL_ENDPOINT};
use anyhow::Result;

#[derive(GraphQLQuery)]
#[graphql(
    schema_path = "../schema.gql",
    query_path = "../gql/Culture.gql",
    response_derives = "Debug"
)]
pub struct GetCultures;

#[derive(GraphQLQuery)]
#[graphql(schema_path = "../schema.gql", query_path = "../gql/Culture.gql")]
pub struct InsertCulture;

pub async fn get_existing_cultures(
    client: &Client,
    data_group_id: i64,
    page: Option<i64>,
) -> Result<graphql_client::Response<get_cultures::ResponseData>> {
    let request_body = GetCultures::build_query(get_cultures::Variables {
        fetch_options: get_cultures::CultureFetchOptions {
            id: get_cultures::OptionalId { id: None },
            limit: Some(100),
            page: Some(page.unwrap_or(1)),
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
        .json::<graphql_client::Response<get_cultures::ResponseData>>()
        .await?)
}
