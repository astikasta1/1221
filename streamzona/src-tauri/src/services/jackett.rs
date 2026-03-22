use crate::models::torrent_result::TorrentResult;
use reqwest::Client;

#[derive(Clone)]
pub struct JackettService {
    client: Client,
    base_url: String,
    api_key: String,
}

impl JackettService {
    pub fn new(base_url: &str, api_key: &str) -> Self {
        Self {
            client: Client::new(),
            base_url: base_url.trim_end_matches('/').to_string(),
            api_key: api_key.to_string(),
        }
    }

    /// Search for torrents via Jackett's Torznab API.
    /// Categories: 2000 = Movies, 5000 = TV.
    pub async fn search(
        &self,
        query: &str,
        category: Option<&str>,
    ) -> Result<Vec<TorrentResult>, String> {
        let cat = match category {
            Some("tv") | Some("TV") => "5000",
            Some("movie") | Some("Movie") | Some("movies") => "2000",
            Some(c) => c,
            None => "2000",
        };

        let encoded_query = urlencoded(query);
        let url = format!(
            "{}/api/v2.0/indexers/all/results/torznab/api?apikey={}&t=search&q={}&cat={}",
            self.base_url, self.api_key, encoded_query, cat
        );

        let resp = self
            .client
            .get(&url)
            .send()
            .await
            .map_err(|e| format!("Jackett request failed: {}", e))?;

        let text = resp
            .text()
            .await
            .map_err(|e| format!("Failed to read Jackett response: {}", e))?;

        let mut results = parse_torznab_xml(&text)?;
        // Sort by seeders descending
        results.sort_by(|a, b| b.seeders.cmp(&a.seeders));

        Ok(results)
    }

    /// Check if the Jackett server is reachable.
    pub async fn check_connection(&self) -> Result<bool, String> {
        let url = format!(
            "{}/api/v2.0/indexers/all/results/torznab/api?apikey={}&t=caps",
            self.base_url, self.api_key
        );

        match self.client.get(&url).send().await {
            Ok(resp) => Ok(resp.status().is_success()),
            Err(_) => Ok(false),
        }
    }
}

/// Parse Torznab XML response into TorrentResult entries.
fn parse_torznab_xml(xml: &str) -> Result<Vec<TorrentResult>, String> {
    let doc = roxmltree::Document::parse(xml)
        .map_err(|e| format!("Failed to parse XML: {}", e))?;

    let mut results = Vec::new();

    for item in doc.descendants().filter(|n| n.has_tag_name("item")) {
        let title = item
            .descendants()
            .find(|n| n.has_tag_name("title"))
            .and_then(|n| n.text())
            .unwrap_or("")
            .to_string();

        if title.is_empty() {
            continue;
        }

        // Try to get magnet URI from various locations
        let magnet_uri = get_torznab_attr(&item, "magneturl")
            .or_else(|| {
                item.descendants()
                    .find(|n| n.has_tag_name("link"))
                    .and_then(|n| n.text())
                    .map(|s| s.to_string())
                    .filter(|s| s.starts_with("magnet:"))
            })
            .unwrap_or_default();

        let size_bytes = get_torznab_attr(&item, "size")
            .and_then(|s| s.parse::<u64>().ok())
            .or_else(|| {
                item.descendants()
                    .find(|n| n.has_tag_name("size"))
                    .and_then(|n| n.text())
                    .and_then(|s| s.parse::<u64>().ok())
            })
            .unwrap_or(0);

        let seeders = get_torznab_attr(&item, "seeders")
            .and_then(|s| s.parse::<u32>().ok())
            .unwrap_or(0);

        let leechers = get_torznab_attr(&item, "peers")
            .and_then(|s| s.parse::<u32>().ok())
            .unwrap_or(0);

        // Try to extract quality from the title
        let quality = extract_quality(&title);

        // Try to extract source/tracker name
        let source = item
            .descendants()
            .find(|n| n.has_tag_name("jackettindexer"))
            .and_then(|n| n.text())
            .unwrap_or("Unknown")
            .to_string();

        let audio = extract_audio(&title);

        results.push(TorrentResult {
            title,
            magnet_uri,
            size_bytes,
            seeders,
            leechers,
            quality,
            source,
            audio,
        });
    }

    Ok(results)
}

/// Get a torznab:attr value by name from an XML item node.
fn get_torznab_attr(item: &roxmltree::Node, name: &str) -> Option<String> {
    item.descendants()
        .find(|n| {
            n.tag_name().name() == "attr"
                && n.attribute("name") == Some(name)
        })
        .and_then(|n| n.attribute("value"))
        .map(|s| s.to_string())
}

/// Extract video quality from a torrent title string.
fn extract_quality(title: &str) -> Option<String> {
    let lower = title.to_lowercase();
    if lower.contains("2160p") || lower.contains("4k") || lower.contains("uhd") {
        Some("2160p".to_string())
    } else if lower.contains("1080p") {
        Some("1080p".to_string())
    } else if lower.contains("720p") {
        Some("720p".to_string())
    } else if lower.contains("480p") {
        Some("480p".to_string())
    } else {
        None
    }
}

/// Extract audio information from a torrent title string.
fn extract_audio(title: &str) -> Option<String> {
    let lower = title.to_lowercase();
    if lower.contains("atmos") {
        Some("Atmos".to_string())
    } else if lower.contains("dts-hd") || lower.contains("dts hd") {
        Some("DTS-HD".to_string())
    } else if lower.contains("dts") {
        Some("DTS".to_string())
    } else if lower.contains("truehd") {
        Some("TrueHD".to_string())
    } else if lower.contains("aac") {
        Some("AAC".to_string())
    } else if lower.contains("ac3") || lower.contains("ac-3") {
        Some("AC3".to_string())
    } else {
        None
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
