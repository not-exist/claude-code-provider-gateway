use crate::config;
use crate::daemon_supervisor::{self, DaemonStatus};
use crate::external_url;
use crate::master_key;
use serde::Serialize;
use tauri::AppHandle;

#[derive(Debug, Serialize)]
pub struct CommandError {
    code: &'static str,
    message: String,
}

impl CommandError {
    fn external_daemon() -> Self {
        Self {
            code: "external_daemon",
            message: "Daemon is managed by the dev watch process".into(),
        }
    }

    fn internal(err: impl std::fmt::Display) -> Self {
        Self {
            code: "internal",
            message: err.to_string(),
        }
    }
}

impl From<anyhow::Error> for CommandError {
    fn from(err: anyhow::Error) -> Self {
        Self::internal(err)
    }
}

impl From<external_url::ExternalUrlError> for CommandError {
    fn from(err: external_url::ExternalUrlError) -> Self {
        Self {
            code: err.code(),
            message: err.to_string(),
        }
    }
}

pub type CommandResult<T> = Result<T, CommandError>;

#[tauri::command]
pub async fn start_daemon(app: AppHandle) -> CommandResult<u32> {
    if config::uses_external_daemon() {
        return Err(CommandError::external_daemon());
    }

    let key = master_key::get_or_create_hex()?;
    daemon_supervisor::get(&app)
        .start(&app, &key)
        .await
        .map_err(Into::into)
}

#[tauri::command]
pub async fn stop_daemon(app: AppHandle) -> CommandResult<()> {
    if config::uses_external_daemon() {
        return Err(CommandError::external_daemon());
    }

    daemon_supervisor::get(&app)
        .stop()
        .await
        .map_err(Into::into)
}

#[tauri::command]
pub async fn daemon_status(app: AppHandle) -> DaemonStatus {
    daemon_supervisor::get(&app).status().await
}

#[tauri::command]
pub async fn open_url(app: AppHandle, url: String) -> CommandResult<()> {
    external_url::open(&app, &url).await.map_err(Into::into)
}
