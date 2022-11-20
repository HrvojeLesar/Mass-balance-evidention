use graphql_client::GraphQLQuery;
use reqwest::Client;

use crate::errors::Result;

use super::GRAPHQL_ENDPOINT;

use super::DateTime;

#[derive(GraphQLQuery)]
#[graphql(
    schema_path = "../schema.gql",
    query_path = "../gql/DataGroup.gql",
    response_derives = "Debug"
)]
pub struct GetDataGroups;

#[derive(GraphQLQuery)]
#[graphql(schema_path = "../schema.gql", query_path = "../gql/DataGroup.gql")]
pub struct InsertDataGroup;

pub async fn get_data_groups(
    client: &Client,
) -> Result<graphql_client::Response<get_data_groups::ResponseData>> {
    let request_body = GetDataGroups::build_query(get_data_groups::Variables {});

    let res = client
        .post(GRAPHQL_ENDPOINT)
        .json(&request_body)
        .send()
        .await?;

    Ok(res
        .json::<graphql_client::Response<get_data_groups::ResponseData>>()
        .await?)
}

pub async fn insert_data_group(
    data_group_name: &str,
    client: &Client,
) -> Result<graphql_client::Response<insert_data_group::ResponseData>> {
    let request_body = InsertDataGroup::build_query(insert_data_group::Variables {
        insert_options: insert_data_group::DataGroupInsertOptions {
            name: data_group_name.to_string(),
            description: None,
        },
    });

    let res = client
        .post(GRAPHQL_ENDPOINT)
        .json(&request_body)
        .send()
        .await?;

    Ok(res
        .json::<graphql_client::Response<insert_data_group::ResponseData>>()
        .await?)
}
