use graphql_client::GraphQLQuery;
use reqwest::Client;

use super::{DateTime, GRAPHQL_ENDPOINT};
use anyhow::Result;

#[derive(GraphQLQuery)]
#[graphql(
    schema_path = "../schema.gql",
    query_path = "../gql/Buyer.gql",
    response_derives = "Debug"
)]
pub struct GetBuyers;

#[derive(GraphQLQuery)]
#[graphql(schema_path = "../schema.gql", query_path = "../gql/Buyer.gql")]
pub struct InsertBuyer;

pub async fn get_existing_buyers(
    client: Client,
    data_group_id: i64,
    page: Option<i64>,
) -> Result<graphql_client::Response<get_buyers::ResponseData>> {
    let request_body = GetBuyers::build_query(get_buyers::Variables {
        fetch_options: get_buyers::BuyerFetchOptions {
            id: get_buyers::OptionalId { id: None },
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
        .json::<graphql_client::Response<get_buyers::ResponseData>>()
        .await?)
}
