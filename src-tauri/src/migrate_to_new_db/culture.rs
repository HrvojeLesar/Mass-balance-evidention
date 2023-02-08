use graphql_client::GraphQLQuery;
use reqwest::Client;

use super::{DateTime, FetchExisting, GRAPHQL_ENDPOINT};
use crate::errors::Result;

use async_trait::async_trait;

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

async fn get_existing_cultures(
    client: &Client,
    data_group_id: i64,
    page: Option<i64>,
) -> Result<graphql_client::Response<get_cultures::ResponseData>> {
    let request_body = GetCultures::build_query(get_cultures::Variables {
        options: get_cultures::CultureFetchOptions {
            id: None,
            page_size: Some(100),
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

#[async_trait]
impl FetchExisting<get_cultures::CultureParts> for GetCultures {
    async fn get_existing(data_group_id: i64) -> Result<Vec<get_cultures::CultureParts>> {
        let mut page = 1;
        let mut existing_cultures = Vec::new();

        let client = Client::new();
        while let Some(data) = get_existing_cultures(&client, data_group_id, Some(page))
            .await?
            .data
        {
            let culture_count = data.cultures.results.len();
            let mut cultures = data.cultures.results;
            existing_cultures.append(&mut cultures);

            if data.cultures.total_items > culture_count as i64 * page {
                page += 1;
            } else {
                break;
            }
        }
        Ok(existing_cultures)
    }
}
