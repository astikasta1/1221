use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TorrentResult {
    pub title: String,
    pub magnet_uri: String,
    pub size_bytes: u64,
    pub seeders: u32,
    pub leechers: u32,
    pub quality: Option<String>,
    pub source: String,
    pub audio: Option<String>,
}
