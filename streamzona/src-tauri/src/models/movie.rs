use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum MediaType {
    Movie,
    Tv,
}

impl Default for MediaType {
    fn default() -> Self {
        MediaType::Movie
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Movie {
    pub id: i64,
    pub title: String,
    pub original_title: String,
    pub year: u16,
    pub overview: String,
    pub poster_path: Option<String>,
    pub backdrop_path: Option<String>,
    pub vote_average: f32,
    pub genre_ids: Vec<i32>,
    pub media_type: MediaType,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Genre {
    pub id: i32,
    pub name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MovieDetails {
    pub id: i64,
    pub title: String,
    pub original_title: String,
    pub year: u16,
    pub overview: String,
    pub poster_path: Option<String>,
    pub backdrop_path: Option<String>,
    pub vote_average: f32,
    pub genre_ids: Vec<i32>,
    pub media_type: MediaType,
    pub runtime: Option<u32>,
    pub genres: Vec<Genre>,
    pub tagline: Option<String>,
}

impl Movie {
    /// Parse a single movie/tv item from a TMDB JSON value.
    pub fn from_tmdb_value(val: &serde_json::Value, default_media_type: Option<&str>) -> Option<Self> {
        let id = val.get("id")?.as_i64()?;

        let media_type_str = val
            .get("media_type")
            .and_then(|v| v.as_str())
            .or(default_media_type)
            .unwrap_or("movie");

        let media_type = match media_type_str {
            "tv" => MediaType::Tv,
            _ => MediaType::Movie,
        };

        let (title, original_title, year) = match media_type {
            MediaType::Movie => {
                let title = val
                    .get("title")
                    .and_then(|v| v.as_str())
                    .unwrap_or("")
                    .to_string();
                let original_title = val
                    .get("original_title")
                    .and_then(|v| v.as_str())
                    .unwrap_or("")
                    .to_string();
                let year = val
                    .get("release_date")
                    .and_then(|v| v.as_str())
                    .and_then(|d| d.get(..4))
                    .and_then(|y| y.parse::<u16>().ok())
                    .unwrap_or(0);
                (title, original_title, year)
            }
            MediaType::Tv => {
                let title = val
                    .get("name")
                    .and_then(|v| v.as_str())
                    .unwrap_or("")
                    .to_string();
                let original_title = val
                    .get("original_name")
                    .and_then(|v| v.as_str())
                    .unwrap_or("")
                    .to_string();
                let year = val
                    .get("first_air_date")
                    .and_then(|v| v.as_str())
                    .and_then(|d| d.get(..4))
                    .and_then(|y| y.parse::<u16>().ok())
                    .unwrap_or(0);
                (title, original_title, year)
            }
        };

        let overview = val
            .get("overview")
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string();

        let poster_path = val
            .get("poster_path")
            .and_then(|v| v.as_str())
            .map(|s| s.to_string());

        let backdrop_path = val
            .get("backdrop_path")
            .and_then(|v| v.as_str())
            .map(|s| s.to_string());

        let vote_average = val
            .get("vote_average")
            .and_then(|v| v.as_f64())
            .unwrap_or(0.0) as f32;

        let genre_ids = val
            .get("genre_ids")
            .and_then(|v| v.as_array())
            .map(|arr| {
                arr.iter()
                    .filter_map(|v| v.as_i64().map(|n| n as i32))
                    .collect()
            })
            .unwrap_or_default();

        Some(Movie {
            id,
            title,
            original_title,
            year,
            overview,
            poster_path,
            backdrop_path,
            vote_average,
            genre_ids,
            media_type,
        })
    }
}

impl MovieDetails {
    /// Parse movie details from a TMDB movie detail response.
    pub fn from_tmdb_value(val: &serde_json::Value, media_type: MediaType) -> Option<Self> {
        let id = val.get("id")?.as_i64()?;

        let (title, original_title, year) = match media_type {
            MediaType::Movie => {
                let title = val
                    .get("title")
                    .and_then(|v| v.as_str())
                    .unwrap_or("")
                    .to_string();
                let original_title = val
                    .get("original_title")
                    .and_then(|v| v.as_str())
                    .unwrap_or("")
                    .to_string();
                let year = val
                    .get("release_date")
                    .and_then(|v| v.as_str())
                    .and_then(|d| d.get(..4))
                    .and_then(|y| y.parse::<u16>().ok())
                    .unwrap_or(0);
                (title, original_title, year)
            }
            MediaType::Tv => {
                let title = val
                    .get("name")
                    .and_then(|v| v.as_str())
                    .unwrap_or("")
                    .to_string();
                let original_title = val
                    .get("original_name")
                    .and_then(|v| v.as_str())
                    .unwrap_or("")
                    .to_string();
                let year = val
                    .get("first_air_date")
                    .and_then(|v| v.as_str())
                    .and_then(|d| d.get(..4))
                    .and_then(|y| y.parse::<u16>().ok())
                    .unwrap_or(0);
                (title, original_title, year)
            }
        };

        let overview = val
            .get("overview")
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string();

        let poster_path = val
            .get("poster_path")
            .and_then(|v| v.as_str())
            .map(|s| s.to_string());

        let backdrop_path = val
            .get("backdrop_path")
            .and_then(|v| v.as_str())
            .map(|s| s.to_string());

        let vote_average = val
            .get("vote_average")
            .and_then(|v| v.as_f64())
            .unwrap_or(0.0) as f32;

        let genre_ids: Vec<i32> = val
            .get("genres")
            .and_then(|v| v.as_array())
            .map(|arr| {
                arr.iter()
                    .filter_map(|g| g.get("id").and_then(|id| id.as_i64()).map(|n| n as i32))
                    .collect()
            })
            .unwrap_or_default();

        let genres: Vec<Genre> = val
            .get("genres")
            .and_then(|v| v.as_array())
            .map(|arr| {
                arr.iter()
                    .filter_map(|g| {
                        let id = g.get("id")?.as_i64()? as i32;
                        let name = g.get("name")?.as_str()?.to_string();
                        Some(Genre { id, name })
                    })
                    .collect()
            })
            .unwrap_or_default();

        let runtime = val.get("runtime").and_then(|v| v.as_u64()).map(|n| n as u32);

        let tagline = val
            .get("tagline")
            .and_then(|v| v.as_str())
            .filter(|s| !s.is_empty())
            .map(|s| s.to_string());

        Some(MovieDetails {
            id,
            title,
            original_title,
            year,
            overview,
            poster_path,
            backdrop_path,
            vote_average,
            genre_ids,
            media_type,
            runtime,
            genres,
            tagline,
        })
    }
}
