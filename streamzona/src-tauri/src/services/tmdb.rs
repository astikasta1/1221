use crate::models::movie::{MediaType, Movie, MovieDetails};
use reqwest::Client;

const BASE_URL: &str = "https://api.themoviedb.org/3";

#[derive(Clone)]
pub struct TmdbService {
    client: Client,
    api_key: String,
}

impl TmdbService {
    pub fn new(api_key: &str) -> Self {
        Self {
            client: Client::new(),
            api_key: api_key.to_string(),
        }
    }

    /// Fetch trending movies or TV shows.
    pub async fn get_trending(
        &self,
        media_type: &str,
        page: u32,
    ) -> Result<Vec<Movie>, String> {
        let url = format!(
            "{}/trending/{}/week?api_key={}&language=ru-RU&page={}",
            BASE_URL, media_type, self.api_key, page
        );
        self.fetch_movie_list(&url, Some(media_type)).await
    }

    /// Fetch popular movies or TV shows.
    pub async fn get_popular(
        &self,
        media_type: &str,
        page: u32,
    ) -> Result<Vec<Movie>, String> {
        let url = format!(
            "{}/{}/popular?api_key={}&language=ru-RU&page={}",
            BASE_URL, media_type, self.api_key, page
        );
        self.fetch_movie_list(&url, Some(media_type)).await
    }

    /// Get detailed info about a movie by ID.
    pub async fn get_movie_details(&self, id: i64) -> Result<MovieDetails, String> {
        let url = format!(
            "{}/movie/{}?api_key={}&language=ru-RU",
            BASE_URL, id, self.api_key
        );

        let resp = self
            .client
            .get(&url)
            .send()
            .await
            .map_err(|e| format!("Request failed: {}", e))?;

        if !resp.status().is_success() {
            // Try as TV show if movie endpoint fails
            return self.get_tv_details(id).await;
        }

        let json: serde_json::Value = resp
            .json()
            .await
            .map_err(|e| format!("Failed to parse response: {}", e))?;

        MovieDetails::from_tmdb_value(&json, MediaType::Movie)
            .ok_or_else(|| "Failed to parse movie details".to_string())
    }

    /// Get detailed info about a TV show by ID (fallback).
    async fn get_tv_details(&self, id: i64) -> Result<MovieDetails, String> {
        let url = format!(
            "{}/tv/{}?api_key={}&language=ru-RU",
            BASE_URL, id, self.api_key
        );

        let resp = self
            .client
            .get(&url)
            .send()
            .await
            .map_err(|e| format!("Request failed: {}", e))?;

        let json: serde_json::Value = resp
            .json()
            .await
            .map_err(|e| format!("Failed to parse response: {}", e))?;

        MovieDetails::from_tmdb_value(&json, MediaType::Tv)
            .ok_or_else(|| "Failed to parse TV details".to_string())
    }

    /// Search for movies and TV shows.
    pub async fn search_multi(
        &self,
        query: &str,
        page: u32,
    ) -> Result<Vec<Movie>, String> {
        let url = format!(
            "{}/search/multi?api_key={}&language=ru-RU&query={}&page={}",
            BASE_URL,
            self.api_key,
            urlencoded(query),
            page
        );
        self.fetch_movie_list(&url, None).await
    }

    /// Get movie recommendations.
    pub async fn get_recommendations(&self, id: i64) -> Result<Vec<Movie>, String> {
        let url = format!(
            "{}/movie/{}/recommendations?api_key={}&language=ru-RU",
            BASE_URL, id, self.api_key
        );
        self.fetch_movie_list(&url, Some("movie")).await
    }

    /// Internal helper to fetch and parse a list of movies from a TMDB results endpoint.
    async fn fetch_movie_list(
        &self,
        url: &str,
        default_media_type: Option<&str>,
    ) -> Result<Vec<Movie>, String> {
        let resp = self
            .client
            .get(url)
            .send()
            .await
            .map_err(|e| format!("Request failed: {}", e))?;

        let json: serde_json::Value = resp
            .json()
            .await
            .map_err(|e| format!("Failed to parse response: {}", e))?;

        let results = json
            .get("results")
            .and_then(|v| v.as_array())
            .ok_or_else(|| "No results array in response".to_string())?;

        let movies: Vec<Movie> = results
            .iter()
            .filter_map(|item| {
                // Skip "person" results from multi search
                let mt = item.get("media_type").and_then(|v| v.as_str());
                if mt == Some("person") {
                    return None;
                }
                Movie::from_tmdb_value(item, default_media_type)
            })
            .collect();

        Ok(movies)
    }
}

/// Simple URL encoding for query strings.
fn urlencoded(s: &str) -> String {
    s.chars()
        .map(|c| match c {
            ' ' => "%20".to_string(),
            '&' => "%26".to_string(),
            '=' => "%3D".to_string(),
            '+' => "%2B".to_string(),
            '#' => "%23".to_string(),
            '?' => "%3F".to_string(),
            other => other.to_string(),
        })
        .collect()
}
