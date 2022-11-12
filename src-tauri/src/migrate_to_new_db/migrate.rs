use std::sync::Arc;

use crate::migrate_to_new_db::{
    cell_culture_pair::GetAllCellCulturePairs,
    entry::{insert_entry, InsertEntry},
};

use super::{
    buyer::{insert_buyer, GetBuyers, InsertBuyer},
    cell::{insert_cell, GetCells, InsertCell},
    cell_culture_pair::{insert_cell_culture_pair, InsertCellCulturePair},
    culture::{insert_culture, GetCultures, InsertCulture},
    data_group::{get_data_groups, insert_data_group},
    entry::get_all_entries,
    get_buyers, get_cell_culture_pairs, get_cells, get_cultures, get_entries, get_paired_db_config,
    get_sqlite_database_pool, DatabaseConfigPair, DateTime, FetchExisting, GRAPHQL_ENDPOINT,
};
use anyhow::{anyhow, Result};
use chrono::Utc;
use futures::{lock::Mutex, stream, StreamExt};
use graphql_client::{GraphQLQuery, Response};
use reqwest::Client;
use serde::Serialize;
use sqlx::SqlitePool;
use tauri::{AppHandle, Manager};

const PROGRESS_EVENT: &str = "progress-event";
const TASK_CHANGE_EVENT: &str = "task-change-event";

#[derive(Clone, Debug, Serialize)]
enum Task {
    FetchRemoteBuyer,
    FetchRemoteCell,
    FetchRemoteCulture,
    FetchRemoteCellCulturePair,
    FetchRemoteEntry,
    FetchLocalBuyer,
    FetchLocalCell,
    FetchLocalCulture,
    FetchLocalCellCulturePair,
    FetchLocalEntry,
    LoadToMigrateBuyer,
    LoadToMigrateCell,
    LoadToMigrateCulture,
    LoadToMigrateCellCulturePair,
    LoadToMigrateEntry,
    InsertBuyer,
    InsertCell,
    InsertCulture,
    InsertCellCulturePair,
    InsertEntry,
}

#[derive(Clone, Debug, Serialize)]
enum MainTask {
    Buyer,
    Cell,
    Culture,
    CellCulturePair,
    Entry,
    DataGroup,
}

#[derive(Clone, Debug, Serialize)]
enum UpdateOn {
    // Buyer,
    // Cell,
    // Culture,
    // CellCulturePair,
    // Entry,
    Overall,
    Other,
}

#[derive(Clone, Debug, Serialize)]
struct ProgressMessage<'a> {
    update_on: UpdateOn,
    progress: &'a Progress,
}

#[derive(Clone, Debug, Serialize)]
struct TaskMessage {
    #[serde(skip_serializing)]
    app_handle: Arc<AppHandle>,
    main_task: Option<MainTask>,
    subtask: Option<Task>,
}

impl TaskMessage {
    fn new(app_handle: Arc<AppHandle>) -> Self {
        Self {
            app_handle,
            main_task: None,
            subtask: None,
        }
    }

    fn emit(&self) -> Result<()> {
        Ok(self.app_handle.emit_all(TASK_CHANGE_EVENT, self)?)
    }

    fn set_main_task(&mut self, task: Option<MainTask>) -> Result<()> {
        self.main_task = task;
        self.subtask = None;
        self.emit()?;
        Ok(())
    }

    fn set_subtask(&mut self, task: Option<Task>) -> Result<()> {
        self.subtask = task;
        self.emit()?;
        Ok(())
    }
}

#[derive(Clone, Debug, Default, Serialize)]
struct Progress {
    migrated: usize,
    skipped: usize,
    failed: usize,
    total: usize,
    total_to_migrate: usize,
}

impl Progress {
    fn emit(&self, app_handle: &AppHandle, update_on: UpdateOn) -> Result<()> {
        Ok(app_handle.emit_all(
            PROGRESS_EVENT,
            ProgressMessage {
                update_on,
                progress: self,
            },
        )?)
    }

    fn calc_skipped(&mut self) {
        if self.total >= self.total_to_migrate {
            self.skipped = self.total - self.total_to_migrate;
        }
    }
}

#[derive(Debug, Default)]
struct MigrationProgress {
    buyer: Progress,
    cell: Progress,
    culture: Progress,
    cell_culture_pair: Progress,
    entry: Progress,
    data_groups: Progress,
    overall: Progress,
}

impl MigrationProgress {
    fn reset(&mut self) {
        self.buyer = Progress::default();
        self.cell = Progress::default();
        self.culture = Progress::default();
        self.cell_culture_pair = Progress::default();
        self.entry = Progress::default();
        self.data_groups = Progress::default();
    }
}

pub struct Migrate {
    app_handle: Arc<AppHandle>,
    progress: Arc<Mutex<MigrationProgress>>,
    client: Client,
    progress_message: TaskMessage,
}

impl Migrate {
    pub(crate) fn new(app_handle: AppHandle) -> Self {
        let app_handle = Arc::new(app_handle);
        Self {
            app_handle: app_handle.clone(),
            progress: Arc::new(Mutex::new(MigrationProgress::default())),
            client: Client::new(),
            progress_message: TaskMessage::new(app_handle),
        }
    }

    pub(crate) async fn start_migrating(&mut self) -> Result<()> {
        let database_config_pairs = get_paired_db_config()?;
        let data_groups = match get_data_groups(&self.client).await?.data {
            Some(d) => d,
            None => return Err(anyhow!("Fetched group data is incomplete.")),
        }
        .data_groups;

        {
            let mut progress = self.progress.lock().await;
            let total = database_config_pairs.len();
            progress.data_groups.total_to_migrate = total;
            progress.overall.total_to_migrate = total;
            progress.overall.emit(&self.app_handle, UpdateOn::Overall)?;
        }

        for dcp in database_config_pairs {
            let db_pool = match get_sqlite_database_pool(&dcp.path).await {
                Ok(db) => db,
                Err(e) => {
                    println!("Error getting database pool: {:?}", e);
                    continue;
                }
            };

            {
                let mut progress = self.progress.lock().await;
                progress.reset();
            }

            self.progress_message
                .set_main_task(Some(MainTask::DataGroup))?;
            let group_id = self.migrate_data_group(&data_groups, &dcp).await?;

            self.progress_message
                .set_main_task(Some(MainTask::Buyer))?;
            self.migrate_buyer(group_id, &db_pool).await?;

            self.progress_message
                .set_main_task(Some(MainTask::Cell))?;
            self.migrate_cell(group_id, &db_pool).await?;

            self.progress_message
                .set_main_task(Some(MainTask::Culture))?;
            self.migrate_culture(group_id, &db_pool).await?;

            self.progress_message
                .set_main_task(Some(MainTask::CellCulturePair))?;
            self.migrate_cell_culture_pair(group_id, &db_pool).await?;

            self.progress_message
                .set_main_task(Some(MainTask::Entry))?;
            self.migrate_entry(group_id, &db_pool).await?;
            {
                let mut progress = self.progress.lock().await;
                progress.overall.migrated += 1;
                progress.overall.emit(&self.app_handle, UpdateOn::Overall)?;
            }
            println!("Done.");
        }
        println!("Done overall.");

        Ok(())
    }

    async fn migrate_data_group(
        &mut self,
        data_groups: &[get_data_groups::DataGroupParts],
        dcp: &DatabaseConfigPair,
    ) -> Result<i64> {
        let group = data_groups.iter().find(|dg| dg.name == dcp.database.alias);
        let mut progress = self.progress.lock().await;
        match group {
            Some(g) => {
                progress.data_groups.skipped += 1;
                Ok(g.id)
            }
            None => {
                let new_data_group = insert_data_group(&dcp.database.alias, &self.client).await?;
                println!("DATA: {}", new_data_group.data.is_some());
                println!("ERRORS: {:#?}", new_data_group.errors);
                let id = new_data_group
                    .data
                    .ok_or_else(|| anyhow!(
                        "Failed to retrieve data about inserted data group!"
                    ))?
                    .insert_data_group
                    .id;
                progress.data_groups.migrated += 1;
                Ok(id)
            }
        }
    }

    async fn migrate_buyer(&mut self, data_group_id: i64, db_pool: &SqlitePool) -> Result<()> {
        self.progress_message
            .set_subtask(Some(Task::FetchRemoteBuyer))?;
        let existing_buyers = GetBuyers::get_existing(data_group_id).await?;

        self.progress_message
            .set_subtask(Some(Task::FetchLocalBuyer))?;
        let buyers = get_buyers(db_pool).await?;

        let mut progress = self.progress.lock().await;
        progress.buyer.total = buyers.len();

        self.progress_message
            .set_subtask(Some(Task::LoadToMigrateBuyer))?;
        let mut buyers_to_migrate = Vec::new();
        for buyer in buyers {
            match existing_buyers.iter().find(|b| b.name == buyer.naziv) {
                Some(_exists_do_nothing) => (),
                None => buyers_to_migrate.push(buyer),
            }
        }
        drop(existing_buyers);

        progress.buyer.total_to_migrate = buyers_to_migrate.len();
        progress.buyer.calc_skipped();
        progress.buyer.emit(&self.app_handle, UpdateOn::Other)?;

        drop(progress);

        let future_stream = stream::iter(buyers_to_migrate)
            .map(|buyer| {
                let client = self.client.clone();
                async move {
                    let request_body = InsertBuyer::build_query(insert_buyer::Variables {
                        insert_options: insert_buyer::BuyerInsertOptions {
                            name: buyer.naziv.unwrap_or_else(|| "".to_owned()),
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

        self.progress_message.set_subtask(Some(Task::InsertBuyer))?;

        future_stream
            .for_each(|fut| {
                let progress = self.progress.clone();
                let handle = self.app_handle.clone();
                async move {
                    let res = match fut {
                        Ok(r) => r,
                        Err(e) => {
                            println!("Error in future: {:?}", e);
                            return;
                        }
                    };

                    let mut progress = progress.lock().await;

                    if let Some(errors) = res.errors {
                        println!("Errors occured during insertion:\n{:#?}", errors);
                        progress.buyer.failed += 1;
                    } else if let Some(data) = res.data {
                        println!("Inserted buyer");
                        println!("{:#?}", data.insert_buyer.name);
                        progress.buyer.migrated += 1;
                    }
                    match progress.buyer.emit(&handle, UpdateOn::Other) {
                        Ok(_) => (),
                        Err(e) => {
                            println!("Error in buyer insertion: {:?}", e);
                        }
                    }
                }
            })
            .await;

        Ok(())
    }

    async fn migrate_cell(&mut self, data_group_id: i64, db_pool: &SqlitePool) -> Result<()> {
        self.progress_message
            .set_subtask(Some(Task::FetchRemoteCell))?;
        let existing_cells = GetCells::get_existing(data_group_id).await?;

        self.progress_message
            .set_subtask(Some(Task::FetchLocalCell))?;
        let cells = get_cells(db_pool).await?;

        let mut progress = self.progress.lock().await;
        progress.cell.total = cells.len();

        self.progress_message
            .set_subtask(Some(Task::LoadToMigrateCell))?;
        let mut cells_to_migrate = Vec::new();
        for cell in cells {
            match existing_cells
                .iter()
                .find(|c| c.name == cell.naziv.clone().unwrap_or_else(|| "".to_owned()))
            {
                Some(_exists_do_nothing) => (),
                None => cells_to_migrate.push(cell),
            }
        }
        drop(existing_cells);

        progress.cell.total_to_migrate = cells_to_migrate.len();
        progress.cell.calc_skipped();
        progress.cell.emit(&self.app_handle, UpdateOn::Other)?;

        drop(progress);

        let future_stream = stream::iter(cells_to_migrate)
            .map(|cell| {
                let client = self.client.clone();
                async move {
                    let request_body = InsertCell::build_query(insert_cell::Variables {
                        insert_options: insert_cell::CellInsertOptions {
                            name: cell.naziv.unwrap_or_else(|| "".to_owned()),
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

        self.progress_message.set_subtask(Some(Task::InsertCell))?;

        future_stream
            .for_each(|fut| {
                let progress = self.progress.clone();
                let handle = self.app_handle.clone();
                async move {
                    let res = match fut {
                        Ok(r) => r,
                        Err(e) => {
                            println!("Error in future: {:?}", e);
                            return;
                        }
                    };

                    let mut progress = progress.lock().await;

                    if let Some(errors) = res.errors {
                        println!("Errors occured during insertion:\n{:#?}", errors);
                        progress.cell.failed += 1;
                    } else if let Some(data) = res.data {
                        println!("Inserted cell");
                        println!("{:#?}", data.insert_cell.name);
                        progress.cell.migrated += 1;
                    }
                    match progress.cell.emit(&handle, UpdateOn::Other) {
                        Ok(_) => (),
                        Err(e) => {
                            println!("Error in cell insertion: {:?}", e);
                        }
                    }
                }
            })
            .await;

        Ok(())
    }

    async fn migrate_culture(&mut self, data_group_id: i64, db_pool: &SqlitePool) -> Result<()> {
        self.progress_message
            .set_subtask(Some(Task::FetchRemoteCulture))?;
        let existing_cultures = GetCultures::get_existing(data_group_id).await?;

        self.progress_message
            .set_subtask(Some(Task::FetchLocalCulture))?;
        let cultures = get_cultures(db_pool).await?;

        let mut progress = self.progress.lock().await;
        progress.culture.total = cultures.len();

        self.progress_message
            .set_subtask(Some(Task::LoadToMigrateCulture))?;
        let mut cultures_to_migrate = Vec::new();
        for culture in cultures {
            match existing_cultures
                .iter()
                .find(|c| c.name == culture.naziv.clone().unwrap_or_else(|| "".to_owned()))
            {
                Some(_exists_do_nothing) => (),
                None => cultures_to_migrate.push(culture),
            }
        }
        drop(existing_cultures);

        progress.culture.total_to_migrate = cultures_to_migrate.len();
        progress.culture.calc_skipped();
        progress.culture.emit(&self.app_handle, UpdateOn::Other)?;

        drop(progress);

        let future_stream = stream::iter(cultures_to_migrate)
            .map(|culture| {
                let client = self.client.clone();
                async move {
                    let request_body = InsertCulture::build_query(insert_culture::Variables {
                        insert_options: insert_culture::CultureInsertOptions {
                            name: culture.naziv.unwrap_or_else(|| "".to_owned()),
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

        self.progress_message
            .set_subtask(Some(Task::InsertCulture))?;

        future_stream
            .for_each(|fut| {
                let progress = self.progress.clone();
                let handle = self.app_handle.clone();
                async move {
                    let res = match fut {
                        Ok(r) => r,
                        Err(e) => {
                            println!("Error in future: {:?}", e);
                            return;
                        }
                    };

                    let mut progress = progress.lock().await;

                    if let Some(errors) = res.errors {
                        println!("Errors occured during insertion:\n{:#?}", errors);
                        progress.culture.failed += 1;
                    } else if let Some(data) = res.data {
                        println!("Inserted culture");
                        println!("{:#?}", data.insert_culture.name);
                        progress.culture.migrated += 1;
                    }
                    match progress.culture.emit(&handle, UpdateOn::Other) {
                        Ok(_) => (),
                        Err(e) => {
                            println!("Error in buyer insertion: {:?}", e);
                        }
                    }
                }
            })
            .await;

        Ok(())
    }

    async fn migrate_cell_culture_pair(
        &mut self,
        data_group_id: i64,
        db_pool: &SqlitePool,
    ) -> Result<()> {
        struct TempCellCulturePairIds {
            cell_id: i64,
            culture_id: i64,
        }

        self.progress_message
            .set_subtask(Some(Task::FetchRemoteCellCulturePair))?;
        let existing_cell_culture_pairs =
            GetAllCellCulturePairs::get_existing(data_group_id).await?;

        self.progress_message
            .set_subtask(Some(Task::FetchLocalCellCulturePair))?;
        let cell_culture_pairs = get_cell_culture_pairs(db_pool).await?;

        let mut progress = self.progress.lock().await;
        progress.cell_culture_pair.total = cell_culture_pairs.len();

        let mut pairs_to_migrate = Vec::new();
        let mut new_pairs = Vec::new();

        self.progress_message
            .set_subtask(Some(Task::LoadToMigrateCellCulturePair))?;
        for ccp in cell_culture_pairs {
            match existing_cell_culture_pairs.iter().find(|c| {
                if let (Some(cell), Some(culture)) = (c.cell.as_ref(), c.culture.as_ref()) {
                    cell.name == ccp.cell.naziv.clone().unwrap_or_else(|| "".to_owned())
                        && culture.name == ccp.culture.naziv.clone().unwrap_or_else(|| "".to_owned())
                } else {
                    false
                }
            }) {
                Some(_exists_do_nothing) => (),
                None => new_pairs.push(ccp),
            }
        }
        drop(existing_cell_culture_pairs);

        self.progress_message
            .set_subtask(Some(Task::FetchRemoteCell))?;
        let existing_cells = GetCells::get_existing(data_group_id).await?;
        self.progress_message
            .set_subtask(Some(Task::FetchRemoteCulture))?;
        let existing_cultures = GetCultures::get_existing(data_group_id).await?;

        self.progress_message
            .set_subtask(Some(Task::LoadToMigrateCellCulturePair))?;
        for np in new_pairs {
            let cell = existing_cells
                .iter()
                .find(|c| c.name == np.cell.naziv.clone().unwrap_or_else(|| "".to_string()));
            if cell.is_none() {
                continue;
            }
            let culture = existing_cultures
                .iter()
                .find(|c| c.name == np.culture.naziv.clone().unwrap_or_else(|| "".to_string()));
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

        progress.cell_culture_pair.total_to_migrate = pairs_to_migrate.len();
        progress.cell_culture_pair.calc_skipped();
        progress
            .cell_culture_pair
            .emit(&self.app_handle, UpdateOn::Other)?;

        drop(progress);

        // let client = Client::new();
        let future_stream = stream::iter(pairs_to_migrate)
            .map(|ccp| {
                let client = self.client.clone();
                async move {
                    let request_body =
                        InsertCellCulturePair::build_query(insert_cell_culture_pair::Variables {
                            insert_options:
                                insert_cell_culture_pair::CellCulturePairInsertOptions {
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

        self.progress_message
            .set_subtask(Some(Task::InsertCellCulturePair))?;

        future_stream
            .for_each(|fut| {
                let progress = self.progress.clone();
                let handle = self.app_handle.clone();
                async move {
                    let res = match fut {
                        Ok(r) => r,
                        Err(e) => {
                            println!("Error in future: {:?}", e);
                            return;
                        }
                    };

                    let mut progress = progress.lock().await;

                    if let Some(errors) = res.errors {
                        println!("Errors occured during insertion:\n{:#?}", errors);
                        progress.cell_culture_pair.failed += 1;
                    } else if let Some(_data) = res.data {
                        println!("Inserted cell_culture_pair");
                        progress.cell_culture_pair.migrated += 1;
                    }
                    match progress.cell_culture_pair.emit(&handle, UpdateOn::Other) {
                        Ok(_) => (),
                        Err(e) => {
                            println!("Error in buyer insertion: {:?}", e);
                        }
                    }
                }
            })
            .await;

        Ok(())
    }

    async fn migrate_entry(&mut self, data_group_id: i64, db_pool: &SqlitePool) -> Result<()> {
        struct TempEntry {
            cell_id: i64,
            culture_id: i64,
            date: Option<DateTime>,
            buyer_id: i64,
            weight: Option<f64>,
        }

        // let client = Client::new();
        self.progress_message
            .set_subtask(Some(Task::FetchRemoteEntry))?;
        let existing_entries = match get_all_entries(&self.client, data_group_id).await?.data {
            Some(d) => d.get_all_entries.results,
            None => Vec::new(),
        };

        self.progress_message
            .set_subtask(Some(Task::FetchLocalEntry))?;
        let entries = get_entries(db_pool).await?;

        let mut progress = self.progress.lock().await;
        progress.entry.total = entries.len();

        let mut entries_to_migrate = Vec::new();
        let mut new_entries = Vec::new();
        self.progress_message
            .set_subtask(Some(Task::LoadToMigrateEntry))?;
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
                                .unwrap_or_else(|| "".to_owned())
                            && culture.name
                                == entry
                                    .cell_culture_pair
                                    .culture
                                    .naziv
                                    .clone()
                                    .unwrap_or_else(|| "".to_owned())
                            && buyer.name.clone().unwrap_or_else(|| "".to_owned())
                                == entry.buyer.naziv.clone().unwrap_or_else(|| "".to_owned())
                            && e.weight.unwrap_or(0.0)
                                == entry.weight.unwrap_or(0.0)
                            && if let Some(e_date) = entry.date {
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

        self.progress_message
            .set_subtask(Some(Task::FetchRemoteCell))?;
        let existing_cells = GetCells::get_existing(data_group_id).await?;
        self.progress_message
            .set_subtask(Some(Task::FetchRemoteCulture))?;
        let existing_cultures = GetCultures::get_existing(data_group_id).await?;
        self.progress_message
            .set_subtask(Some(Task::FetchRemoteBuyer))?;
        let existing_buyers = GetBuyers::get_existing(data_group_id).await?;

        self.progress_message
            .set_subtask(Some(Task::LoadToMigrateEntry))?;
        for ne in new_entries {
            let cell = existing_cells.iter().find(|c| {
                c.name
                    == ne
                        .cell_culture_pair
                        .cell
                        .naziv
                        .clone()
                        .unwrap_or_else(|| "".to_string())
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
                        .unwrap_or_else(|| "".to_string())
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

        progress.entry.total_to_migrate = entries_to_migrate.len();
        progress.entry.calc_skipped();
        progress.entry.emit(&self.app_handle, UpdateOn::Other)?;

        drop(progress);

        let future_stream = stream::iter(entries_to_migrate)
            .map(|entry| {
                let client = self.client.clone();
                async move {
                    let request_body = InsertEntry::build_query(insert_entry::Variables {
                        insert_options: insert_entry::EntryInsertOptions {
                            date: entry.date.unwrap_or_else(Utc::now),
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

        self.progress_message.set_subtask(Some(Task::InsertEntry))?;

        future_stream
            .for_each(|fut| {
                let progress = self.progress.clone();
                let handle = self.app_handle.clone();
                async move {
                    let res = match fut {
                        Ok(r) => r,
                        Err(e) => {
                            println!("Error in future: {:?}", e);
                            return;
                        }
                    };

                    let mut progress = progress.lock().await;

                    if let Some(errors) = res.errors {
                        println!("Errors occured during insertion:\n{:#?}", errors);
                        progress.entry.failed += 1;
                    } else if let Some(_data) = res.data {
                        println!("Inserted entry");
                        progress.entry.migrated += 1;
                    }
                    match progress.cell_culture_pair.emit(&handle, UpdateOn::Other) {
                        Ok(_) => (),
                        Err(e) => {
                            println!("Error in buyer insertion: {:?}", e);
                        }
                    }
                }
            })
            .await;

        Ok(())
    }
}

// #[cfg(test)]
// mod tests {
//     use crate::migrate_to_new_db::migrate::start_migrating;
//     #[tokio::test]
//     async fn migrate_buyers_test() {
//         start_migrating().await.unwrap();
//     }
// }
