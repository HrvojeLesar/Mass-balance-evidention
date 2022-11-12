use graphql_client::GraphQLQuery;
use reqwest::Client;

use super::{DateTime, FetchExisting, GRAPHQL_ENDPOINT};
use anyhow::Result;

use async_trait::async_trait;

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

async fn get_all_existing_cell_culture_pairs(
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

#[async_trait]
impl FetchExisting<get_all_cell_culture_pairs::CellCultureParts> for GetAllCellCulturePairs {
    async fn get_existing(
        data_group_id: i64,
    ) -> Result<Vec<get_all_cell_culture_pairs::CellCultureParts>> {
        let client = Client::new();
        Ok(
            match get_all_existing_cell_culture_pairs(&client, data_group_id)
                .await?
                .data
            {
                Some(d) => d.get_all_cell_culture_pairs.results,
                None => Vec::new(),
            },
        )
    }
}
