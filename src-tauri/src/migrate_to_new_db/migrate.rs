use super::{
    buyer::{get_existing_buyers, insert_buyer, InsertBuyer},
    cell::{get_existing_cells, insert_cell, InsertCell},
    culture::{get_existing_cultures, insert_culture, InsertCulture},
    data_group::{get_data_groups, insert_data_group, GetDataGroups},
    get_buyers, get_cells, get_cultures, get_paired_db_config, get_sqlite_database_pool,
    DatabaseConfigPair, GRAPHQL_ENDPOINT,
};
use anyhow::{anyhow, Result};
use futures::{stream, StreamExt};
use graphql_client::{GraphQLQuery, Response};
use reqwest::Client;
use sqlx::SqlitePool;

struct MigrationProgress {
    dbs_to_migrate: u64,
}

pub(crate) async fn start_migrating() -> Result<()> {
    let database_config_pairs = get_paired_db_config()?;
    let client = Client::new();
    let data_groups = match get_data_groups(client.clone()).await?.data {
        Some(d) => d,
        None => return Err(anyhow!("Fetched group data is incomplete.")),
    }
    .data_groups;

    for dcp in database_config_pairs {
        let db_pool = match get_sqlite_database_pool(&dcp.path).await {
            Ok(db) => db,
            Err(e) => {
                println!("Error getting database pool: {:?}", e);
                continue;
            }
        };

        let group_id = migrate_data_group(&data_groups, &dcp, client.clone()).await?;
        migrate_buyer(group_id, &db_pool, client.clone()).await?;
        migrate_cell(group_id, &db_pool, client.clone()).await?;
        migrate_culture(group_id, &db_pool, client.clone()).await?;
    }

    Ok(())
}

async fn migrate_data_group(
    data_groups: &Vec<get_data_groups::DataGroupParts>,
    dcp: &DatabaseConfigPair,
    client: Client,
) -> Result<i64> {
    let group = data_groups.iter().find(|dg| dg.name == dcp.database.alias);
    match group {
        Some(g) => Ok(g.id),
        None => {
            let data = insert_data_group(&dcp.database.alias, client.clone()).await?;
            println!("DATA: {}", data.data.is_some());
            println!("ERRORS: {:#?}", data.errors);
            Ok(data
                .data
                .ok_or(anyhow!(
                    "Failed to retrieve data about inserted data group!"
                ))?
                .insert_data_group
                .id)
        }
    }
}

async fn migrate_buyer(data_group_id: i64, db_pool: &SqlitePool, client: Client) -> Result<()> {
    let mut page = 1;
    let mut existing_buyers = Vec::new();

    loop {
        let data = match get_existing_buyers(client.clone(), data_group_id, Some(page))
            .await?
            .data
        {
            Some(b) => b,
            None => break,
        };
        let buyer_count = data.buyers.results.len();
        let mut buyers = data.buyers.results;
        existing_buyers.append(&mut buyers);

        if data.buyers.total > buyer_count as i64 * page {
            page += 1;
        } else {
            break;
        }
    }

    let buyers = get_buyers(&db_pool).await?;

    let mut buyers_to_migrate = Vec::new();

    for buyer in buyers {
        match existing_buyers.iter().find(|b| b.name == buyer.naziv) {
            Some(_exists_do_nothing) => (),
            None => buyers_to_migrate.push(buyer),
        }
    }
    drop(existing_buyers);

    let future_stream = stream::iter(buyers_to_migrate)
        .map(|buyer| {
            let client = client.clone();
            async move {
                let request_body = InsertBuyer::build_query(insert_buyer::Variables {
                    insert_options: insert_buyer::BuyerInsertOptions {
                        name: buyer.naziv.unwrap_or("".to_owned()),
                        address: None,
                        contact: None,
                        d_group: Some(data_group_id),
                    },
                });

                let res = client
                    .post(GRAPHQL_ENDPOINT)
                    .json(&request_body)
                    .send()
                    .await?;

                let response = res.json().await?;

                anyhow::Ok::<Response<insert_buyer::ResponseData>>(response)
            }
        })
        .buffer_unordered(10);

    future_stream
        .for_each(|fut| async {
            let res = match fut {
                Ok(r) => r,
                Err(e) => {
                    println!("Error in future: {:?}", e);
                    return;
                }
            };

            if let Some(errors) = res.errors {
                println!("Errors occured during insertion:\n{:#?}", errors);
                return;
            }

            if let Some(data) = res.data {
                println!("Inserted buyer");
                println!("{:#?}", data.insert_buyer.name);
            }
        })
        .await;

    Ok(())
}

async fn migrate_cell(data_group_id: i64, db_pool: &SqlitePool, client: Client) -> Result<()> {
    let mut page = 1;
    let mut existing_cells = Vec::new();

    loop {
        let data = match get_existing_cells(client.clone(), data_group_id, Some(page))
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

    let cells = get_cells(&db_pool).await?;

    let mut cells_to_migrate = Vec::new();

    for cell in cells {
        match existing_cells
            .iter()
            .find(|c| c.name == cell.naziv.clone().unwrap_or("".to_owned()))
        {
            Some(_exists_do_nothing) => (),
            None => cells_to_migrate.push(cell),
        }
    }
    drop(existing_cells);

    let future_stream = stream::iter(cells_to_migrate)
        .map(|cell| {
            let client = client.clone();
            async move {
                let request_body = InsertCell::build_query(insert_cell::Variables {
                    insert_options: insert_cell::CellInsertOptions {
                        name: cell.naziv.unwrap_or("".to_owned()),
                        description: None,
                        d_group: Some(data_group_id),
                    },
                });

                let res = client
                    .post(GRAPHQL_ENDPOINT)
                    .json(&request_body)
                    .send()
                    .await?;

                let response = res.json().await?;

                anyhow::Ok::<Response<insert_cell::ResponseData>>(response)
            }
        })
        .buffer_unordered(10);

    future_stream
        .for_each(|fut| async {
            let res = match fut {
                Ok(r) => r,
                Err(e) => {
                    println!("Error in future: {:?}", e);
                    return;
                }
            };

            if let Some(errors) = res.errors {
                println!("Errors occured during insertion:\n{:#?}", errors);
                return;
            }

            if let Some(data) = res.data {
                println!("Inserted cell");
                println!("{:#?}", data.insert_cell.name);
            }
        })
        .await;

    Ok(())
}

async fn migrate_culture(data_group_id: i64, db_pool: &SqlitePool, client: Client) -> Result<()> {
    let mut page = 1;
    let mut existing_cultures = Vec::new();

    loop {
        let data = match get_existing_cultures(client.clone(), data_group_id, Some(page))
            .await?
            .data
        {
            Some(b) => b,
            None => break,
        };
        let culture_countn = data.cultures.results.len();
        let mut cultures = data.cultures.results;
        existing_cultures.append(&mut cultures);

        if data.cultures.total > culture_countn as i64 * page {
            page += 1;
        } else {
            break;
        }
    }

    let cultures = get_cultures(&db_pool).await?;

    let mut cultures_to_migrate = Vec::new();

    for culture in cultures {
        match existing_cultures
            .iter()
            .find(|c| c.name == culture.naziv.clone().unwrap_or("".to_owned()))
        {
            Some(_exists_do_nothing) => (),
            None => cultures_to_migrate.push(culture),
        }
    }
    drop(existing_cultures);

    let future_stream = stream::iter(cultures_to_migrate)
        .map(|culture| {
            let client = client.clone();
            async move {
                let request_body = InsertCulture::build_query(insert_culture::Variables {
                    insert_options: insert_culture::CultureInsertOptions {
                        name: culture.naziv.unwrap_or("".to_owned()),
                        description: None,
                        d_group: Some(data_group_id),
                    },
                });

                let res = client
                    .post(GRAPHQL_ENDPOINT)
                    .json(&request_body)
                    .send()
                    .await?;

                let response = res.json().await?;

                anyhow::Ok::<Response<insert_culture::ResponseData>>(response)
            }
        })
        .buffer_unordered(10);

    future_stream
        .for_each(|fut| async {
            let res = match fut {
                Ok(r) => r,
                Err(e) => {
                    println!("Error in future: {:?}", e);
                    return;
                }
            };

            if let Some(errors) = res.errors {
                println!("Errors occured during insertion:\n{:#?}", errors);
                return;
            }

            if let Some(data) = res.data {
                println!("Inserted culture");
                println!("{:#?}", data.insert_culture.name);
            }
        })
        .await;

    Ok(())
}

#[cfg(test)]
mod tests {
    use crate::migrate_to_new_db::migrate::start_migrating;

    #[tokio::test]
    async fn migrate_buyers_test() {
        start_migrating().await.unwrap();
    }
}
