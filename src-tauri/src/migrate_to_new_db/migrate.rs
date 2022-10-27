use crate::migrate_to_new_db::entry::{insert_entry, InsertEntry};

use super::{
    buyer::{get_existing_buyers, insert_buyer, InsertBuyer},
    cell::{get_existing_cells, insert_cell, InsertCell},
    cell_culture_pair::{
        get_all_existing_cell_culture_pairs, insert_cell_culture_pair, InsertCellCulturePair,
    },
    culture::{get_existing_cultures, insert_culture, InsertCulture},
    data_group::{get_data_groups, insert_data_group, GetDataGroups},
    entry::get_all_entries,
    get_buyers, get_cell_culture_pairs, get_cells, get_cultures, get_entries, get_paired_db_config,
    get_sqlite_database_pool, DatabaseConfigPair, DateTime, GRAPHQL_ENDPOINT,
};
use anyhow::{anyhow, Result};
use chrono::{NaiveDate, Utc};
use futures::{stream, StreamExt};
use graphql_client::{GraphQLQuery, Response};
use reqwest::Client;
use sqlx::SqlitePool;

#[derive(Default)]
struct Progress {
    migrated: u64,
    skipped: u64,
    failed: u64,
}

#[derive(Default)]
struct MigrationProgress {
    buyer: Progress,
    cell: Progress,
    culture: Progress,
    cell_culture_pair: Progress,
    entry: Progress,
}

pub(crate) async fn start_migrating() -> Result<()> {
    let database_config_pairs = get_paired_db_config()?;
    let client = Client::new();
    let data_groups = match get_data_groups(&client).await?.data {
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

        let group_id = migrate_data_group(&data_groups, &dcp, &client).await?;
        migrate_buyer(group_id, &db_pool).await?;
        migrate_cell(group_id, &db_pool).await?;
        migrate_culture(group_id, &db_pool).await?;
        migrate_cell_culture_pair(group_id, &db_pool).await?;
        migrate_entry(group_id, &db_pool).await?;
    }

    Ok(())
}

async fn migrate_data_group(
    data_groups: &Vec<get_data_groups::DataGroupParts>,
    dcp: &DatabaseConfigPair,
    client: &Client,
) -> Result<i64> {
    let group = data_groups.iter().find(|dg| dg.name == dcp.database.alias);
    match group {
        Some(g) => Ok(g.id),
        None => {
            let data = insert_data_group(&dcp.database.alias, client).await?;
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

async fn migrate_buyer(data_group_id: i64, db_pool: &SqlitePool) -> Result<()> {
    let mut page = 1;
    let mut existing_buyers = Vec::new();

    let client = Client::new();
    loop {
        let data = match get_existing_buyers(&client, data_group_id, Some(page))
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

async fn migrate_cell(data_group_id: i64, db_pool: &SqlitePool) -> Result<()> {
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

async fn migrate_culture(data_group_id: i64, db_pool: &SqlitePool) -> Result<()> {
    let mut page = 1;
    let mut existing_cultures = Vec::new();

    let client = Client::new();
    loop {
        let data = match get_existing_cultures(&client, data_group_id, Some(page))
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

async fn migrate_cell_culture_pair(data_group_id: i64, db_pool: &SqlitePool) -> Result<()> {
    struct TempCellCulturePairIds {
        cell_id: i64,
        culture_id: i64,
    }

    let client = Client::new();
    let existing_cell_culture_pairs =
        match get_all_existing_cell_culture_pairs(&client, data_group_id)
            .await?
            .data
        {
            Some(d) => d.get_all_cell_culture_pairs.results,
            None => Vec::new(),
        };

    let cell_culture_pairs = get_cell_culture_pairs(&db_pool).await?;

    let mut pairs_to_migrate = Vec::new();
    let mut new_pairs = Vec::new();

    for ccp in cell_culture_pairs {
        match existing_cell_culture_pairs.iter().find(|c| {
            if let (Some(cell), Some(culture)) = (c.cell.as_ref(), c.culture.as_ref()) {
                cell.name == ccp.cell.naziv.clone().unwrap_or("".to_owned())
                    && culture.name == ccp.culture.naziv.clone().unwrap_or("".to_owned())
            } else {
                false
            }
        }) {
            Some(_exists_do_nothing) => (),
            None => new_pairs.push(ccp),
        }
    }
    drop(existing_cell_culture_pairs);

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

    let mut page = 1;
    let mut existing_cultures = Vec::new();
    let client = Client::new();
    loop {
        let data = match get_existing_cultures(&client, data_group_id, Some(page))
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

    for np in new_pairs {
        let cell = existing_cells
            .iter()
            .find(|c| c.name == np.cell.naziv.clone().unwrap_or("".to_string()));
        if cell.is_none() {
            continue;
        }
        let culture = existing_cultures
            .iter()
            .find(|c| c.name == np.culture.naziv.clone().unwrap_or("".to_string()));
        if culture.is_none() {
            continue;
        }

        if let (Some(cell), Some(culture)) = (cell, culture) {
            pairs_to_migrate.push(TempCellCulturePairIds {
                cell_id: cell.id,
                culture_id: culture.id,
            });
        }
    }
    drop(existing_cells);
    drop(existing_cultures);

    let client = Client::new();
    let future_stream = stream::iter(pairs_to_migrate)
        .map(|ccp| {
            let client = client.clone();
            async move {
                let request_body =
                    InsertCellCulturePair::build_query(insert_cell_culture_pair::Variables {
                        insert_options: insert_cell_culture_pair::CellCulturePairInsertOptions {
                            id_cell: ccp.cell_id,
                            id_culture: ccp.culture_id,
                            d_group: data_group_id,
                        },
                    });

                let res = client
                    .post(GRAPHQL_ENDPOINT)
                    .json(&request_body)
                    .send()
                    .await?;

                let response = res.json().await?;

                anyhow::Ok::<Response<insert_cell_culture_pair::ResponseData>>(response)
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

            if let Some(_data) = res.data {
                println!("Inserted cell_culture_pair");
            }
        })
        .await;

    Ok(())
}

async fn migrate_entry(data_group_id: i64, db_pool: &SqlitePool) -> Result<()> {
    struct TempEntry {
        cell_id: i64,
        culture_id: i64,
        date: Option<DateTime>,
        buyer_id: i64,
        weight: Option<f64>,
    }

    let client = Client::new();
    let existing_entries = match get_all_entries(&client, data_group_id).await?.data {
        Some(d) => d.get_all_entries.results,
        None => Vec::new(),
    };

    let entries = get_entries(&db_pool).await?;

    let mut entries_to_migrate = Vec::new();
    let mut new_entries = Vec::new();

    for entry in entries {
        match existing_entries.iter().find(|e| {
            if let Some(cell_culture_pair) = e.cell_culture_pair.as_ref() {
                if let (Some(cell), Some(culture), Some(buyer)) = (
                    cell_culture_pair.cell.as_ref(),
                    cell_culture_pair.culture.as_ref(),
                    e.buyer.as_ref(),
                ) {
                    cell.name
                        == entry
                            .cell_culture_pair
                            .cell
                            .naziv
                            .clone()
                            .unwrap_or("".to_owned())
                        && culture.name
                            == entry
                                .cell_culture_pair
                                .culture
                                .naziv
                                .clone()
                                .unwrap_or("".to_owned())
                        && buyer.name.clone().unwrap_or("".to_owned())
                            == entry.buyer.naziv.clone().unwrap_or("".to_owned())
                        && e.weight.clone().unwrap_or(0.0) == entry.weight.clone().unwrap_or(0.0)
                        && if let Some(e_date) = entry.date.clone() {
                            e.date.date_naive() == e_date
                        } else {
                            false
                        }
                } else {
                    false
                }
            } else {
                false
            }
        }) {
            Some(_exists_do_nothing) => (),
            None => new_entries.push(entry),
        }
    }

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

    let mut page = 1;
    let mut existing_cultures = Vec::new();
    let client = Client::new();
    loop {
        let data = match get_existing_cultures(&client, data_group_id, Some(page))
            .await?
            .data
        {
            Some(b) => b,
            None => break,
        };
        let culture_count = data.cultures.results.len();
        let mut cultures = data.cultures.results;
        existing_cultures.append(&mut cultures);

        if data.cultures.total > culture_count as i64 * page {
            page += 1;
        } else {
            break;
        }
    }

    let mut page = 1;
    let mut existing_buyers = Vec::new();
    let client = Client::new();
    loop {
        let data = match get_existing_buyers(&client, data_group_id, Some(page))
            .await?
            .data
        {
            Some(b) => b,
            None => break,
        };
        let buyer_count = data.buyers.results.len();
        let mut cultures = data.buyers.results;
        existing_buyers.append(&mut cultures);

        if data.buyers.total > buyer_count as i64 * page {
            page += 1;
        } else {
            break;
        }
    }

    for ne in new_entries {
        let cell = existing_cells.iter().find(|c| {
            c.name
                == ne
                    .cell_culture_pair
                    .cell
                    .naziv
                    .clone()
                    .unwrap_or("".to_string())
        });
        if cell.is_none() {
            continue;
        }
        let culture = existing_cultures.iter().find(|c| {
            c.name
                == ne
                    .cell_culture_pair
                    .culture
                    .naziv
                    .clone()
                    .unwrap_or("".to_string())
        });
        if culture.is_none() {
            continue;
        }
        let buyer = existing_buyers.iter().find(|c| c.name == ne.buyer.naziv);
        if buyer.is_none() {
            continue;
        }

        if let (Some(cell), Some(culture), Some(buyer)) = (cell, culture, buyer) {
            entries_to_migrate.push(TempEntry {
                date: ne.date.map_or(Some(Utc::now()), |d| {
                    Some(DateTime::from_utc(d.and_hms(0, 0, 0), Utc))
                }),
                cell_id: cell.id,
                culture_id: culture.id,
                buyer_id: buyer.id,
                weight: ne.weight,
            });
        }
    }

    drop(existing_buyers);
    drop(existing_entries);
    drop(existing_cultures);
    drop(existing_cells);

    let future_stream = stream::iter(entries_to_migrate)
        .map(|entry| {
            let client = client.clone();
            async move {
                let request_body = InsertEntry::build_query(insert_entry::Variables {
                    insert_options: insert_entry::EntryInsertOptions {
                        date: entry.date.unwrap_or(Utc::now()),
                        weight: entry.weight,
                        weight_type: None,
                        id_buyer: Some(entry.buyer_id),
                        cell_culture_pair: insert_entry::CellCulturePairInsertOptions {
                            id_cell: entry.cell_id,
                            id_culture: entry.culture_id,
                            d_group: data_group_id,
                        },
                        d_group: Some(data_group_id),
                    },
                });

                let res = client
                    .post(GRAPHQL_ENDPOINT)
                    .json(&request_body)
                    .send()
                    .await?;

                let response = res.json().await?;

                anyhow::Ok::<Response<insert_entry::ResponseData>>(response)
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

            if let Some(_data) = res.data {
                println!("Inserted entry");
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
