use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};

/// Information about an active stream.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StreamInfo {
    pub url: String,
    pub file_name: String,
}

/// Status of the current torrent download/stream.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StreamStatus {
    pub progress: f32,
    pub download_speed: u64,
    pub peers: u32,
    pub state: String,
}

/// TorrentEngine manages interaction with a torrent-stream-server instance.
/// It is Clone-able so it can be extracted from a Mutex without holding the guard.
#[derive(Clone)]
pub struct TorrentEngine {
    port: u16,
    client: Client,
    current_stream: Arc<Mutex<Option<StreamInfo>>>,
}

impl TorrentEngine {
    pub fn new(port: u16) -> Self {
        Self {
            port,
            client: Client::new(),
            current_stream: Arc::new(Mutex::new(None)),
        }
    }

    /// Start streaming a torrent by magnet URI.
    /// Sends a request to the torrent-stream-server to begin downloading and streaming.
    pub async fn start_stream(&self, magnet_uri: &str) -> Result<StreamInfo, String> {
        let url = format!("http://127.0.0.1:{}/api/stream", self.port);

        let body = serde_json::json!({
            "magnet": magnet_uri
        });

        let resp = self
            .client
            .post(&url)
            .json(&body)
            .send()
            .await
            .map_err(|e| {
                format!(
                    "Failed to connect to torrent-stream-server on port {}: {}. \
                     Make sure torrent-stream-server is running.",
                    self.port, e
                )
            })?;

        if !resp.status().is_success() {
            return Err(format!(
                "torrent-stream-server returned status {}",
                resp.status()
            ));
        }

        let json: serde_json::Value = resp
            .json()
            .await
            .map_err(|e| format!("Failed to parse stream response: {}", e))?;

        let stream_url = json
            .get("url")
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string();

        let file_name = json
            .get("file_name")
            .or_else(|| json.get("fileName"))
            .and_then(|v| v.as_str())
            .unwrap_or("video")
            .to_string();

        let info = StreamInfo {
            url: if stream_url.is_empty() {
                format!("http://127.0.0.1:{}/stream", self.port)
            } else {
                stream_url
            },
            file_name,
        };

        // Store current stream info
        if let Ok(mut current) = self.current_stream.lock() {
            *current = Some(info.clone());
        }

        Ok(info)
    }

    /// Stop the current stream.
    pub async fn stop_stream(&self) -> Result<(), String> {
        let url = format!("http://127.0.0.1:{}/api/stop", self.port);

        // Clear current stream info regardless of server response
        if let Ok(mut current) = self.current_stream.lock() {
            *current = None;
        }

        // Best-effort stop request to the server
        let _ = self.client.post(&url).send().await;

        Ok(())
    }

    /// Get the status of the current torrent download.
    pub async fn get_status(&self) -> Result<StreamStatus, String> {
        let url = format!("http://127.0.0.1:{}/api/status", self.port);

        let resp = self
            .client
            .get(&url)
            .send()
            .await
            .map_err(|e| {
                format!(
                    "Failed to get stream status: {}. Is torrent-stream-server running?",
                    e
                )
            })?;

        if !resp.status().is_success() {
            return Ok(StreamStatus {
                progress: 0.0,
                download_speed: 0,
                peers: 0,
                state: "idle".to_string(),
            });
        }

        let json: serde_json::Value = resp
            .json()
            .await
            .map_err(|e| format!("Failed to parse status response: {}", e))?;

        Ok(StreamStatus {
            progress: json
                .get("progress")
                .and_then(|v| v.as_f64())
                .unwrap_or(0.0) as f32,
            download_speed: json
                .get("download_speed")
                .or_else(|| json.get("downloadSpeed"))
                .and_then(|v| v.as_u64())
                .unwrap_or(0),
            peers: json
                .get("peers")
                .and_then(|v| v.as_u64())
                .unwrap_or(0) as u32,
            state: json
                .get("state")
                .and_then(|v| v.as_str())
                .unwrap_or("unknown")
                .to_string(),
        })
    }
}
