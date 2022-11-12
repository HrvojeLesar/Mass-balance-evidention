use graphql_client::GraphQLQuery;
use reqwest::Client;

use super::{DateTime, FetchExisting, GRAPHQL_ENDPOINT};
use anyhow::Result;

use async_trait::async_trait;

#[derive(GraphQLQuery)]
#[graphql(
    schema_path = "../schema.gql",
    query_path = "../gql/Cell.gql",
    response_derives = "Debug"
)]
pub struct GetCells;

#[derive(GraphQLQuery)]
#[graphql(schema_path = "../schema.gql", query_path = "../gql/Cell.gql")]
pub struct InsertCell;

async fn get_existing_cells(
    client: &Client,
    data_group_id: i64,
    page: Option<i64>,
) -> Result<graphql_client::Response<get_cells::ResponseData>> {
    let request_body = GetCells::build_query(get_cells::Variables {
        fetch_options: get_cells::CellFetchOptions {
            id: get_cells::OptionalId { id: None },
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
        .json::<graphql_client::Response<get_cells::ResponseData>>()
        .await?)
}

#[async_trait]
impl FetchExisting<get_cells::CellParts> for GetCells {
    async fn get_existing(data_group_id: i64) -> Result<Vec<get_cells::CellParts>> {
        let mut page = 1;
        let mut existing_cells = Vec::new();

        let client = Client::new();
        loop {
            let data = match get_existing_cells(&client, data_group_id, Some(page))
                .await?
                .data
            {
                Some(b) => b,
                None => break,
            };
            let cell_count = data.cells.results.len();
            let mut cells = data.cells.results;
            existing_cells.append(&mut cells);

            if data.cells.total > cell_count as i64 * page {
                page += 1;
            } else {
                break;
            }
        }
        Ok(existing_cells)
    }
}
