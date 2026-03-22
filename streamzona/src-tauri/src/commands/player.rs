use crate::services::torrent::{StreamInfo, StreamStatus};
use crate::AppState;
use tauri::State;

#[tauri::command]
pub async fn start_stream(
    state: State<'_, AppState>,
    magnet_uri: String,
) -> Result<StreamInfo, String> {
    let engine = {
        let guard = state.torrent.lock().map_err(|e| e.to_string())?;
        guard.clone()
    };
    engine.start_stream(&magnet_uri).await
}

#[tauri::command]
pub async fn stop_stream(
    state: State<'_, AppState>,
) -> Result<(), String> {
    let engine = {
        let guard = state.torrent.lock().map_err(|e| e.to_string())?;
        guard.clone()
    };
    engine.stop_stream().await
}

#[tauri::command]
pub async fn get_stream_status(
    state: State<'_, AppState>,
) -> Result<StreamStatus, String> {
    let engine = {
        let guard = state.torrent.lock().map_err(|e| e.to_string())?;
        guard.clone()
    };
    engine.get_status().await
}
