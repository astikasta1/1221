mod commands;
mod db;
mod models;
mod services;

use db::Database;
use models::settings::AppSettings;
use services::jackett::JackettService;
use services::tmdb::TmdbService;
use services::torrent::TorrentEngine;
use std::sync::{Arc, Mutex};
use tauri::Manager;

/// Global application state shared across all Tauri commands.
pub struct AppState {
    pub db: Arc<Database>,
    pub tmdb: Mutex<Option<TmdbService>>,
    pub jackett: Mutex<Option<JackettService>>,
    pub torrent: Mutex<TorrentEngine>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // Initialize logging in debug builds
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // Determine database path in the app's data directory
            let app_data_dir = app
                .path()
                .app_data_dir()
                .expect("Failed to resolve app data directory");
            std::fs::create_dir_all(&app_data_dir)
                .expect("Failed to create app data directory");

            let db_path = app_data_dir.join("streamzona.db");
            let db_path_str = db_path.to_string_lossy().to_string();

            // Initialize database
            let db = Arc::new(
                Database::new(&db_path_str).expect("Failed to initialize database"),
            );

            // Load settings from DB
            let settings_map = db.get_all_settings();
            let settings = AppSettings::from_map(&settings_map);

            // Initialize TMDB service if API key is configured
            let tmdb = if !settings.tmdb_api_key.is_empty() {
                Some(TmdbService::new(&settings.tmdb_api_key))
            } else {
                None
            };

            // Initialize Jackett service if configured
            let jackett =
                if !settings.jackett_api_key.is_empty() && !settings.jackett_url.is_empty() {
                    Some(JackettService::new(
                        &settings.jackett_url,
                        &settings.jackett_api_key,
                    ))
                } else {
                    None
                };

            // Initialize torrent engine
            let torrent = TorrentEngine::new(settings.stream_port);

            // Build and manage application state
            let state = AppState {
                db,
                tmdb: Mutex::new(tmdb),
                jackett: Mutex::new(jackett),
                torrent: Mutex::new(torrent),
            };

            app.manage(state);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::catalog::get_trending,
            commands::catalog::get_popular,
            commands::catalog::get_movie_details,
            commands::catalog::get_recommendations,
            commands::catalog::search_catalog,
            commands::search::search_torrents,
            commands::player::start_stream,
            commands::player::stop_stream,
            commands::player::get_stream_status,
            commands::settings::get_settings,
            commands::settings::save_settings,
            commands::settings::check_jackett_connection,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
