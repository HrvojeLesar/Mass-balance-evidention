use std::{
    fs::read_to_string,
    path::{Path, PathBuf},
};

use chrono::{NaiveDate, Utc};
use directories::UserDirs;
use serde::Deserialize;
use sqlx::{sqlite::SqlitePoolOptions, SqlitePool};

use anyhow::{anyhow, Result};

pub mod buyer;
pub mod cell;
pub mod cell_culture_pair;
pub mod culture;
pub mod data_group;
pub mod migrate;
pub mod entry;

pub(super) type DateTime = chrono::DateTime<Utc>;

const DB_EXTENSION: &str = "db";

pub const GRAPHQL_ENDPOINT: &str = "http://localhost:8000/graphiql";

#[derive(Debug)]
struct Buyer {
    id: i64,
    naziv: Option<String>,
}

#[derive(Debug)]
struct Cell {
    id: i64,
    naziv: Option<String>,
}

#[derive(Debug)]
struct Culture {
    id: i64,
    naziv: Option<String>,
}

#[derive(Debug)]
struct CellCulturePair {
    cell: Cell,
    culture: Culture,
}

impl CellCulturePair {
    /// Returns a touple as (id_cell, id_culture)
    fn get_pair_id(&self) -> (i64, i64) {
        (self.cell.id, self.culture.id)
    }
}

#[derive(Debug)]
struct Entry {
    id: i64,
    weight: Option<f64>,
    cell_culture_pair: CellCulturePair,
    date: Option<NaiveDate>,
    buyer: Buyer,
}

#[derive(Deserialize, Debug, Clone)]
pub(super) struct MbeConfigJsonDatabase {
    alias: String,
    path: String,
}

#[derive(Deserialize, Debug, Clone)]
pub(super) struct MbeConfigJson {
    version: i32,
    #[serde(rename = "currentDb")]
    current_db: MbeConfigJsonDatabase,
    databases: Vec<MbeConfigJsonDatabase>,
}

pub(super) struct DatabaseConfigPair {
    database: MbeConfigJsonDatabase,
    path: PathBuf,
}

fn get_old_mbe_config_dir() -> Result<PathBuf> {
    let user_dirs = match UserDirs::new() {
        Some(d) => d,
        None => {
            return Err(anyhow!(
                "No valid home directory can be retrieved from the operating system."
            ))
        }
    };
    let mut home_dir = user_dirs.home_dir().to_path_buf();
    home_dir.push(".mass-balance-evidention");
    if !home_dir.is_dir() {
        return Err(anyhow!("No previous configuration or databases exist."));
    }

    Ok(home_dir)
}

pub(super) fn get_mbe_dbs() -> Result<Vec<PathBuf>> {
    let mut databases = Vec::new();

    let config_dir = get_old_mbe_config_dir()?;

    for entry in config_dir.read_dir()?.flatten() {
        match entry.path().extension() {
            Some(ext) => {
                if ext != DB_EXTENSION {
                    continue;
                }
            }
            None => continue,
        };
        databases.push(entry.path());
    }

    Ok(databases)
}

pub(super) fn get_mbe_config() -> Result<MbeConfigJson> {
    let config_dir = get_old_mbe_config_dir()?;
    let config_file = match config_dir
        .read_dir()?
        .flatten()
        .find(|entry| entry.file_name() == "config.json")
    {
        Some(cfg) => cfg.path(),
        None => return Err(anyhow!("Config file not found!")),
    };

    let file_contents = read_to_string(config_file)?;
    Ok(serde_json::from_str(&file_contents)?)
}

pub(super) fn get_paired_db_config() -> Result<Vec<DatabaseConfigPair>> {
    let dbs = get_mbe_dbs()?;
    let config = get_mbe_config()?;

    let mut pairs = Vec::new();

    for db in dbs {
        match config.databases.iter().find(|c_db| {
            let file_name = match db.file_name() {
                Some(f) => f.to_os_string(),
                None => return false,
            };
            format!("{}.db", c_db.path).as_str() == file_name
        }) {
            Some(config_database) => pairs.push(DatabaseConfigPair {
                database: config_database.clone(),
                path: db,
            }),
            None => continue,
        }
    }

    Ok(pairs)
}

pub(super) async fn get_sqlite_database_pool(path: &Path) -> Result<SqlitePool> {
    let path_as_string = match path.to_str() {
        Some(path) => path,
        None => {
            return Err(anyhow!(
                "Failed to create a string from given database path!"
            ))
        }
    };
    let connection_string = format!("sqlite:{}", path_as_string);
    println!("connection string: {}", connection_string);
    Ok(SqlitePoolOptions::new()
        .max_connections(5)
        .connect(&connection_string)
        .await?)
}

async fn get_buyers(pool: &SqlitePool) -> Result<Vec<Buyer>> {
    let mut transaction = pool.begin().await?;

    let rows: Vec<Buyer> = sqlx::query_as!(Buyer, "SELECT * FROM kupci")
        .fetch_all(&mut transaction)
        .await?;

    transaction.commit().await?;

    Ok(rows)
}

async fn get_cells(pool: &SqlitePool) -> Result<Vec<Cell>> {
    let mut transaction = pool.begin().await?;

    let rows: Vec<Cell> = sqlx::query_as!(Cell, "SELECT * FROM cestica")
        .fetch_all(&mut transaction)
        .await?;

    transaction.commit().await.unwrap();

    Ok(rows)
}

async fn get_cultures(pool: &SqlitePool) -> Result<Vec<Culture>> {
    let mut transaction = pool.begin().await?;

    let rows: Vec<Culture> = sqlx::query_as!(Culture, "SELECT * FROM kultura")
        .fetch_all(&mut transaction)
        .await?;

    transaction.commit().await.unwrap();

    Ok(rows)
}

async fn get_cell_culture_pairs(pool: &SqlitePool) -> Result<Vec<CellCulturePair>> {
    let mut transaction = pool.begin().await?;

    let rows = sqlx::query!(
        "
        SELECT 
            cestica.id as c_id,
            cestica.naziv as c_name,
            kultura.id as cc_id,
            kultura.naziv as cc_name
        FROM cestica_kultura
        INNER JOIN cestica ON cestica.id = cestica_kultura.id_cestica
        INNER JOIN kultura ON kultura.id = cestica_kultura.id_kultura
        "
    )
    .fetch_all(&mut transaction)
    .await?;

    let rows = rows
        .into_iter()
        .map(|row| CellCulturePair {
            cell: Cell {
                id: row.c_id,
                naziv: row.c_name,
            },
            culture: Culture {
                id: row.cc_id,
                naziv: row.cc_name,
            },
        })
        .collect();

    transaction.commit().await.unwrap();

    Ok(rows)
}

async fn get_entries(pool: &SqlitePool) -> Result<Vec<Entry>> {
    let mut transaction = pool.begin().await?;

    let rows = sqlx::query!(
        r#"
        SELECT 
            zapisi.id as e_id,
            zapisi.tezina as e_weight,
            zapisi.datum as "e_date: NaiveDate",
            cestica.id as c_id,
            cestica.naziv as c_name,
            kultura.id as cc_id,
            kultura.naziv as cc_name,
            kupci.id as b_id,
            kupci.naziv as b_name
        FROM zapisi
        INNER JOIN cestica ON cestica.id = zapisi.id_cestica
        INNER JOIN kultura ON kultura.id = zapisi.id_kultura
        INNER JOIN kupci ON kupci.id = zapisi.id_kupac
        "#
    )
    .fetch_all(&mut transaction)
    .await?;

    let rows = rows
        .into_iter()
        .map(|row| Entry {
            id: row.e_id,
            date: row.e_date,
            weight: row.e_weight,
            buyer: Buyer {
                id: row.b_id,
                naziv: row.b_name,
            },
            cell_culture_pair: CellCulturePair {
                cell: Cell {
                    id: row.c_id,
                    naziv: row.c_name,
                },
                culture: Culture {
                    id: row.cc_id,
                    naziv: row.cc_name,
                },
            },
        })
        .collect();

    transaction.commit().await.unwrap();

    Ok(rows)
}

#[cfg(test)]
mod tests {
    use crate::migrate_to_new_db::get_mbe_dbs;

    use super::get_mbe_config;

    // #[test]
    // fn get_mbe_config_test() {
    //     println!("{:?}", get_mbe_config().unwrap());
    // }

    // #[test]
    // fn get_mbe_dbs_test() {
    //     println!("{:?}", get_mbe_dbs().unwrap());
    // }

    // use futures::{stream, StreamExt};
    // use graphql_client::{GraphQLQuery, Response};
    // use reqwest::Client;
    //
    // use crate::migrate_to_new_db::{
    //     get_buyers, get_cell_culture_pairs, get_cells, get_cultures, GetDataGroups,
    // };
    //
    // use super::{
    //     get_buyers::{BuyerFetchOptions, BuyerFields, BuyerOrderingOptions, Ordering, Variables},
    //     get_data_groups, get_entries, get_mbe_dbs, get_sqlite_database_pool, GetBuyers,
    // };

    // #[tokio::test]
    // async fn test_get_entries() {
    //     let dbs = get_mbe_dbs().unwrap();
    //     let db_path = dbs.first().unwrap();
    //     let data_group_name = db_path.file_name().unwrap();
    //     let pool = get_sqlite_database_pool(db_path).await.unwrap();
    //     let entries = get_entries(&pool).await.unwrap();
    //     get_cells(&pool).await.unwrap();
    //     get_cultures(&pool).await.unwrap();
    //     get_buyers(&pool).await.unwrap();
    //     get_cell_culture_pairs(&pool).await.unwrap();
    //
    //     let first_entry = entries.first().unwrap();
    //     let client = Client::new();
    //
    //     async fn find_data_group() -> Response<get_data_groups::ResponseData> {
    //         let client = Client::new();
    //         let request_body = GetDataGroups::build_query(get_data_groups::Variables {});
    //         let res = client
    //             .post("http://localhost:8000/graphiql")
    //             .json(&request_body)
    //             .send()
    //             .await
    //             .unwrap();
    //
    //         res.json::<Response<get_data_groups::ResponseData>>()
    //             .await
    //             .unwrap()
    //     }
    //
    //     let existing_data_groups = find_data_group().await.data.unwrap().data_groups;
    //
    //     println!("{:#?}", dbs);
    //     // println!("{:#?}", existing_data_groups);
    //
    //     // let bodies = stream::iter(0..1000)
    //     //     .map(|i| {
    //     //         let client = client.clone();
    //     //         tokio::spawn(async move {
    //     //             println!("{}", i);
    //     //             let request_body = GetBuyers::build_query(Variables {
    //     //                 fetch_options: BuyerFetchOptions {
    //     //                     id: get_buyers::OptionalId { id: None },
    //     //                     ordering: Some(BuyerOrderingOptions {
    //     //                         order: Ordering::ASC,
    //     //                         order_by: BuyerFields::NAME,
    //     //                     }),
    //     //                     data_group_id: Some(1),
    //     //                     page: None,
    //     //                     limit: None,
    //     //                     filters: None,
    //     //                 },
    //     //             });
    //     //             let res = client
    //     //                 .post("http://localhost:8000/graphiql")
    //     //                 .json(&request_body)
    //     //                 .send()
    //     //                 .await
    //     //                 .unwrap();
    //     //             let response: Response<get_buyers::ResponseData> = res.json().await.unwrap();
    //     //         })
    //     //     })
    //     //     .buffer_unordered(10);
    //     // bodies
    //     //     .for_each(|b| async {
    //     //         match b {
    //     //             Ok(()) => println!("Ok"),
    //     //             Err(_e) => println!("JoinError"),
    //     //         }
    //     //     })
    //     //     .await;
    // }
}
