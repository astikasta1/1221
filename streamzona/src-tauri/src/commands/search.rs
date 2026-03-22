use crate::models::torrent_result::TorrentResult;
use crate::AppState;
use tauri::State;

#[tauri::command]
pub async fn search_torrents(
    state: State<'_, AppState>,
    query: String,
    category: Option<String>,
) -> Result<Vec<TorrentResult>, String> {
    let jackett = {
        let guard = state.jackett.lock().map_err(|e| e.to_string())?;
        guard
            .as_ref()
            .cloned()
            .ok_or_else(|| "Jackett is not configured. Please set the URL and API key in Settings.".to_string())?
    };

    jackett
        .search(&query, category.as_deref())
        .await
}
