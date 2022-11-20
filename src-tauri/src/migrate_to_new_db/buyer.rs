use graphql_client::GraphQLQuery;
use reqwest::Client;

use super::{DateTime, FetchExisting, GRAPHQL_ENDPOINT};
use crate::errors::Result;

use async_trait::async_trait;

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

async fn get_existing_buyers(
    client: &Client,
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

#[async_trait]
impl FetchExisting<get_buyers::BuyerParts> for GetBuyers {
    async fn get_existing(data_group_id: i64) -> Result<Vec<get_buyers::BuyerParts>> {
        let mut page = 1;
        let mut existing_buyers = Vec::new();

        let client = Client::new();
        while let Some(data) = get_existing_buyers(&client, data_group_id, Some(page))
            .await?
            .data
        {
            let buyer_count = data.buyers.results.len();
            let mut buyers = data.buyers.results;
            existing_buyers.append(&mut buyers);

            if data.buyers.total > buyer_count as i64 * page {
                page += 1;
            } else {
                break;
            }
        }
        Ok(existing_buyers)
    }
}
