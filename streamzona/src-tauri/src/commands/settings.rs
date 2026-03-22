use crate::models::settings::AppSettings;
use crate::services::jackett::JackettService;
use crate::services::tmdb::TmdbService;
use crate::AppState;
use tauri::State;

#[tauri::command]
pub async fn get_settings(
    state: State<'_, AppState>,
) -> Result<AppSettings, String> {
    let map = state.db.get_all_settings();
    Ok(AppSettings::from_map(&map))
}

#[tauri::command]
pub async fn save_settings(
    state: State<'_, AppState>,
    settings: AppSettings,
) -> Result<(), String> {
    // Persist all settings to the database
    let map = settings.to_map();
    for (key, value) in &map {
        state.db.set_setting(key, value);
    }

    // Re-initialize TMDB service if the API key changed
    if !settings.tmdb_api_key.is_empty() {
        let mut tmdb_guard = state.tmdb.lock().map_err(|e| e.to_string())?;
        *tmdb_guard = Some(TmdbService::new(&settings.tmdb_api_key));
    }

    // Re-initialize Jackett service if configured
    if !settings.jackett_api_key.is_empty() && !settings.jackett_url.is_empty() {
        let mut jackett_guard = state.jackett.lock().map_err(|e| e.to_string())?;
        *jackett_guard = Some(JackettService::new(
            &settings.jackett_url,
            &settings.jackett_api_key,
        ));
    }

    Ok(())
}

#[tauri::command]
pub async fn check_jackett_connection(
    state: State<'_, AppState>,
) -> Result<bool, String> {
    let jackett = {
        let guard = state.jackett.lock().map_err(|e| e.to_string())?;
        guard.as_ref().cloned()
    };

    match jackett {
        Some(j) => j.check_connection().await,
        None => Ok(false),
    }
}
