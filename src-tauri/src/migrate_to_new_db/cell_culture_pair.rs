use graphql_client::GraphQLQuery;
use reqwest::Client;

use super::{DateTime, GRAPHQL_ENDPOINT};
use anyhow::Result;

#[derive(GraphQLQuery)]
#[graphql(
    schema_path = "../schema.gql",
    query_path = "../gql/CellCulturePair.gql",
    response_derives = "Debug"
)]
pub struct GetAllCellCulturePairs;

#[derive(GraphQLQuery)]
#[graphql(
    schema_path = "../schema.gql",
    query_path = "../gql/CellCulturePair.gql"
)]
pub struct InsertCellCulturePair;

pub async fn get_all_existing_cell_culture_pairs(
    client: &Client,
    data_group_id: i64,
) -> Result<graphql_client::Response<get_all_cell_culture_pairs::ResponseData>> {
    let request_body = GetAllCellCulturePairs::build_query(get_all_cell_culture_pairs::Variables {
        fetch_options: get_all_cell_culture_pairs::CellCulturePairFetchOptions {
            id: get_all_cell_culture_pairs::OptionalCellCulturePairIds {
                cell_id: None,
                culture_id: None,
                d_group: None,
            },
            limit: None,
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
        .json::<graphql_client::Response<get_all_cell_culture_pairs::ResponseData>>()
        .await?)
}
