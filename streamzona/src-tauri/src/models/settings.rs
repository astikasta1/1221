use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    pub jackett_url: String,
    pub jackett_api_key: String,
    pub tmdb_api_key: String,
    pub download_path: String,
    pub preferred_quality: String,
    pub language: String,
    pub stream_port: u16,
    pub autoplay: bool,
    pub torrent_enabled: bool,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            jackett_url: "http://127.0.0.1:9117".to_string(),
            jackett_api_key: String::new(),
            tmdb_api_key: String::new(),
            download_path: String::new(),
            preferred_quality: "1080p".to_string(),
            language: "ru-RU".to_string(),
            stream_port: 8888,
            autoplay: false,
            torrent_enabled: false,
        }
    }
}

impl AppSettings {
    /// Build AppSettings from a HashMap of key-value pairs (from the database).
    pub fn from_map(map: &HashMap<String, String>) -> Self {
        let defaults = Self::default();
        Self {
            jackett_url: map
                .get("jackett_url")
                .cloned()
                .unwrap_or(defaults.jackett_url),
            jackett_api_key: map
                .get("jackett_api_key")
                .cloned()
                .unwrap_or(defaults.jackett_api_key),
            tmdb_api_key: map
                .get("tmdb_api_key")
                .cloned()
                .unwrap_or(defaults.tmdb_api_key),
            download_path: map
                .get("download_path")
                .cloned()
                .unwrap_or(defaults.download_path),
            preferred_quality: map
                .get("preferred_quality")
                .cloned()
                .unwrap_or(defaults.preferred_quality),
            language: map
                .get("language")
                .cloned()
                .unwrap_or(defaults.language),
            stream_port: map
                .get("stream_port")
                .and_then(|v| v.parse().ok())
                .unwrap_or(defaults.stream_port),
            autoplay: map
                .get("autoplay")
                .map(|v| v == "true")
                .unwrap_or(defaults.autoplay),
            torrent_enabled: map
                .get("torrent_enabled")
                .map(|v| v == "true")
                .unwrap_or(defaults.torrent_enabled),
        }
    }

    /// Convert settings to a HashMap for storing in the database.
    pub fn to_map(&self) -> HashMap<String, String> {
        let mut map = HashMap::new();
        map.insert("jackett_url".to_string(), self.jackett_url.clone());
        map.insert("jackett_api_key".to_string(), self.jackett_api_key.clone());
        map.insert("tmdb_api_key".to_string(), self.tmdb_api_key.clone());
        map.insert("download_path".to_string(), self.download_path.clone());
        map.insert(
            "preferred_quality".to_string(),
            self.preferred_quality.clone(),
        );
        map.insert("language".to_string(), self.language.clone());
        map.insert("stream_port".to_string(), self.stream_port.to_string());
        map.insert("autoplay".to_string(), self.autoplay.to_string());
        map.insert(
            "torrent_enabled".to_string(),
            self.torrent_enabled.to_string(),
        );
        map
    }
}
