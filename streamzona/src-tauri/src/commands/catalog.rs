use crate::models::movie::{Movie, MovieDetails};
use crate::AppState;
use tauri::State;

/// Clone the TmdbService out of the mutex so we don't hold the guard across await.
fn clone_tmdb(state: &State<'_, AppState>) -> Result<crate::services::tmdb::TmdbService, String> {
    let guard = state.tmdb.lock().map_err(|e| e.to_string())?;
    guard
        .as_ref()
        .cloned()
        .ok_or_else(|| "TMDB API key is not configured. Please set it in Settings.".to_string())
}

#[tauri::command]
pub async fn get_trending(
    state: State<'_, AppState>,
    media_type: String,
    page: u32,
) -> Result<Vec<Movie>, String> {
    let cache_key = format!("trending_{}_{}", media_type, page);

    // Check cache first
    if let Some(cached) = state.db.get_cached_data(&cache_key) {
        if let Ok(movies) = serde_json::from_str::<Vec<Movie>>(&cached) {
            return Ok(movies);
        }
    }

    let tmdb = clone_tmdb(&state)?;
    let movies = tmdb.get_trending(&media_type, page).await?;

    if let Ok(json) = serde_json::to_string(&movies) {
        state.db.set_cached_data(&cache_key, &json);
    }

    Ok(movies)
}

#[tauri::command]
pub async fn get_popular(
    state: State<'_, AppState>,
    media_type: String,
    page: u32,
) -> Result<Vec<Movie>, String> {
    let cache_key = format!("popular_{}_{}", media_type, page);

    if let Some(cached) = state.db.get_cached_data(&cache_key) {
        if let Ok(movies) = serde_json::from_str::<Vec<Movie>>(&cached) {
            return Ok(movies);
        }
    }

    let tmdb = clone_tmdb(&state)?;
    let movies = tmdb.get_popular(&media_type, page).await?;

    if let Ok(json) = serde_json::to_string(&movies) {
        state.db.set_cached_data(&cache_key, &json);
    }

    Ok(movies)
}

#[tauri::command]
pub async fn get_movie_details(
    state: State<'_, AppState>,
    id: i64,
) -> Result<MovieDetails, String> {
    let cache_key = format!("details_{}", id);

    if let Some(cached) = state.db.get_cached_data(&cache_key) {
        if let Ok(details) = serde_json::from_str::<MovieDetails>(&cached) {
            return Ok(details);
        }
    }

    let tmdb = clone_tmdb(&state)?;
    let details = tmdb.get_movie_details(id).await?;

    if let Ok(json) = serde_json::to_string(&details) {
        state.db.set_cached_data(&cache_key, &json);
    }

    Ok(details)
}

#[tauri::command]
pub async fn get_recommendations(
    state: State<'_, AppState>,
    id: i64,
) -> Result<Vec<Movie>, String> {
    let cache_key = format!("recommendations_{}", id);

    if let Some(cached) = state.db.get_cached_data(&cache_key) {
        if let Ok(movies) = serde_json::from_str::<Vec<Movie>>(&cached) {
            return Ok(movies);
        }
    }

    let tmdb = clone_tmdb(&state)?;
    let movies = tmdb.get_recommendations(id).await?;

    if let Ok(json) = serde_json::to_string(&movies) {
        state.db.set_cached_data(&cache_key, &json);
    }

    Ok(movies)
}

#[tauri::command]
pub async fn search_catalog(
    state: State<'_, AppState>,
    query: String,
    page: u32,
) -> Result<Vec<Movie>, String> {
    let cache_key = format!("search_{}_{}", query, page);

    if let Some(cached) = state.db.get_cached_data(&cache_key) {
        if let Ok(movies) = serde_json::from_str::<Vec<Movie>>(&cached) {
            return Ok(movies);
        }
    }

    let tmdb = clone_tmdb(&state)?;
    let movies = tmdb.search_multi(&query, page).await?;

    if let Ok(json) = serde_json::to_string(&movies) {
        state.db.set_cached_data(&cache_key, &json);
    }

    Ok(movies)
}
