#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use migrate_to_new_db::migrate::Migrate;
use serde::Serialize;
use tauri::{AppHandle, Manager};

mod migrate_to_new_db;

#[derive(Clone, Serialize)]
struct TestEventPayload {
    msg: String,
}

#[tauri::command]
async fn try_start_import(app: AppHandle) -> tauri::Result<()> {
    let mut mig = Migrate::new(app);
    mig.start_migrating().await.unwrap();
    Ok(())
}

#[tokio::main]
async fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![try_start_import])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
