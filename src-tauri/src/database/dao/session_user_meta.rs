use crate::database::{lock_conn, Database};
use crate::error::AppError;
use crate::session_manager::SessionUserMetaRecord;
use rusqlite::params;
use std::collections::HashMap;

impl Database {
    pub fn get_session_user_meta(
        &self,
    ) -> Result<HashMap<String, SessionUserMetaRecord>, AppError> {
        let conn = lock_conn!(self.conn);
        let mut stmt = conn
            .prepare(
                "SELECT provider_id, session_id, source_path, custom_title, is_pinned, updated_at
                 FROM session_user_meta",
            )
            .map_err(|e| AppError::Database(e.to_string()))?;

        let rows = stmt
            .query_map([], |row| {
                Ok(SessionUserMetaRecord {
                    provider_id: row.get(0)?,
                    session_id: row.get(1)?,
                    source_path: row.get(2)?,
                    custom_title: row.get(3)?,
                    is_pinned: row.get::<_, i64>(4)? != 0,
                    updated_at: row.get(5)?,
                })
            })
            .map_err(|e| AppError::Database(e.to_string()))?;

        let mut out = HashMap::new();
        for row in rows {
            let record = row.map_err(|e| AppError::Database(e.to_string()))?;
            let key = crate::session_manager::session_key(
                &record.provider_id,
                &record.session_id,
                Some(&record.source_path),
            );
            out.insert(key, record);
        }

        Ok(out)
    }

    pub fn upsert_session_user_meta(
        &self,
        provider_id: &str,
        session_id: &str,
        source_path: &str,
        custom_title: Option<&str>,
        is_pinned: bool,
    ) -> Result<(), AppError> {
        let conn = lock_conn!(self.conn);
        let updated_at = chrono::Utc::now().timestamp_millis();
        conn.execute(
            "INSERT INTO session_user_meta (
                provider_id, session_id, source_path, custom_title, is_pinned, updated_at
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6)
            ON CONFLICT(provider_id, session_id, source_path) DO UPDATE SET
                custom_title = excluded.custom_title,
                is_pinned = excluded.is_pinned,
                updated_at = excluded.updated_at",
            params![
                provider_id,
                session_id,
                source_path,
                custom_title,
                if is_pinned { 1 } else { 0 },
                updated_at,
            ],
        )
        .map_err(|e| AppError::Database(e.to_string()))?;
        Ok(())
    }

    pub fn clear_session_user_meta(
        &self,
        provider_id: &str,
        session_id: &str,
        source_path: &str,
    ) -> Result<(), AppError> {
        let conn = lock_conn!(self.conn);
        conn.execute(
            "DELETE FROM session_user_meta WHERE provider_id = ?1 AND session_id = ?2 AND source_path = ?3",
            params![provider_id, session_id, source_path],
        )
        .map_err(|e| AppError::Database(e.to_string()))?;
        Ok(())
    }
}
