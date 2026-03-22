use rusqlite::Connection;

/// Run all database migrations to create the required tables.
pub fn run_migrations(conn: &Connection) {
    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS movies_cache (
            cache_key TEXT PRIMARY KEY,
            data TEXT NOT NULL,
            created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
        );

        CREATE TABLE IF NOT EXISTS favorites (
            id INTEGER PRIMARY KEY,
            movie_id INTEGER NOT NULL UNIQUE,
            data TEXT NOT NULL,
            added_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
        );

        CREATE TABLE IF NOT EXISTS watch_history (
            id INTEGER PRIMARY KEY,
            movie_id INTEGER NOT NULL,
            data TEXT NOT NULL,
            progress REAL NOT NULL DEFAULT 0.0,
            watched_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
            UNIQUE(movie_id)
        );

        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );
        ",
    )
    .expect("Failed to run database migrations");
}
