pub mod migrations;

use rusqlite::Connection;
use std::collections::HashMap;
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};

/// Cache time-to-live in seconds (1 hour).
const CACHE_TTL_SECS: u64 = 3600;

pub struct Database {
    conn: Mutex<Connection>,
}

impl Database {
    /// Open the database at the given path and run migrations.
    pub fn new(path: &str) -> Result<Self, String> {
        let conn = Connection::open(path).map_err(|e| format!("Failed to open database: {}", e))?;

        // Enable WAL mode for better concurrent read performance.
        conn.pragma_update(None, "journal_mode", "WAL")
            .map_err(|e| format!("Failed to set WAL mode: {}", e))?;

        migrations::run_migrations(&conn);

        Ok(Self {
            conn: Mutex::new(conn),
        })
    }

    /// Get cached data by key. Returns None if the key doesn't exist or has expired.
    pub fn get_cached_data(&self, key: &str) -> Option<String> {
        let conn = self.conn.lock().ok()?;
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .ok()?
            .as_secs();
        let cutoff = now.saturating_sub(CACHE_TTL_SECS);

        conn.query_row(
            "SELECT data FROM movies_cache WHERE cache_key = ?1 AND created_at > ?2",
            rusqlite::params![key, cutoff as i64],
            |row| row.get::<_, String>(0),
        )
        .ok()
    }

    /// Insert or update cached data for a key.
    pub fn set_cached_data(&self, key: &str, data: &str) {
        let conn = match self.conn.lock() {
            Ok(c) => c,
            Err(_) => return,
        };
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs() as i64;

        let _ = conn.execute(
            "INSERT INTO movies_cache (cache_key, data, created_at) VALUES (?1, ?2, ?3)
             ON CONFLICT(cache_key) DO UPDATE SET data = excluded.data, created_at = excluded.created_at",
            rusqlite::params![key, data, now],
        );
    }

    /// Get a single setting value by key.
    pub fn get_setting(&self, key: &str) -> Option<String> {
        let conn = self.conn.lock().ok()?;
        conn.query_row(
            "SELECT value FROM settings WHERE key = ?1",
            rusqlite::params![key],
            |row| row.get::<_, String>(0),
        )
        .ok()
    }

    /// Set a single setting value.
    pub fn set_setting(&self, key: &str, value: &str) {
        let conn = match self.conn.lock() {
            Ok(c) => c,
            Err(_) => return,
        };
        let _ = conn.execute(
            "INSERT INTO settings (key, value) VALUES (?1, ?2)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            rusqlite::params![key, value],
        );
    }

    /// Retrieve all settings as a HashMap.
    pub fn get_all_settings(&self) -> HashMap<String, String> {
        let conn = match self.conn.lock() {
            Ok(c) => c,
            Err(_) => return HashMap::new(),
        };

        let mut stmt = match conn.prepare("SELECT key, value FROM settings") {
            Ok(s) => s,
            Err(_) => return HashMap::new(),
        };

        let rows = match stmt.query_map([], |row| {
            Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
        }) {
            Ok(rows) => rows,
            Err(_) => return HashMap::new(),
        };

        let mut map = HashMap::new();
        for row in rows {
            if let Ok((key, value)) = row {
                map.insert(key, value);
            }
        }
        map
    }
}
