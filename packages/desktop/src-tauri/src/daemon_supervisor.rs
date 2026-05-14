// Owns the lifecycle of the daemon sidecar process. Spawn / kill / status,
// guarded by an async mutex so concurrent Tauri commands can't race.

use crate::config::SECRET_KEY_ENV;
use anyhow::{anyhow, Context, Result};
use serde::Serialize;
use std::path::PathBuf;
use std::sync::Arc;
use tauri::{AppHandle, Manager};
use tauri_plugin_shell::process::{CommandChild, CommandEvent};
use tauri_plugin_shell::ShellExt;
use tokio::sync::Mutex;

const SIDECAR_NAME: &str = "claude-code-provider-gateway-daemon";

#[derive(Default)]
pub struct DaemonSupervisor {
    child: Mutex<Option<CommandChild>>,
}

#[derive(Serialize)]
pub struct DaemonStatus {
    pub running: bool,
    pub pid: Option<u32>,
}

impl DaemonSupervisor {
    pub fn new() -> Arc<Self> {
        Arc::new(Self::default())
    }

    pub async fn start(&self, app: &AppHandle, master_key_hex: &str) -> Result<u32> {
        {
            let guard = self.child.lock().await;
            if let Some(child) = guard.as_ref() {
                return Ok(child.pid());
            }
        }

        // A previous tauri dev that died without a clean ExitRequested can
        // leave the daemon running and holding port 6767. The new sidecar
        // would then crash with EADDRINUSE and the panel would silently talk
        // to the stale (old-code) daemon. Sweep before we spawn.
        tauri::async_runtime::spawn_blocking(kill_stale_daemon)
            .await
            .context("stale daemon cleanup task failed")?;

        let mut guard = self.child.lock().await;
        if let Some(child) = guard.as_ref() {
            return Ok(child.pid());
        }

        let sidecar = app
            .shell()
            .sidecar(SIDECAR_NAME)
            .context("sidecar binary not declared in tauri.conf.json")?
            .env(SECRET_KEY_ENV, master_key_hex);

        let (mut rx, child) = sidecar.spawn().context("failed to spawn daemon sidecar")?;

        let pid = child.pid();
        *guard = Some(child);

        // Drain stdout/stderr so the daemon doesn't block on a full pipe.
        tauri::async_runtime::spawn(async move {
            while let Some(event) = rx.recv().await {
                match event {
                    CommandEvent::Stdout(line) => {
                        log::info!("[daemon] {}", String::from_utf8_lossy(&line).trim_end())
                    }
                    CommandEvent::Stderr(line) => {
                        log::warn!("[daemon] {}", String::from_utf8_lossy(&line).trim_end())
                    }
                    CommandEvent::Error(err) => log::error!("[daemon] error: {err}"),
                    CommandEvent::Terminated(payload) => {
                        log::info!("[daemon] exited code={:?}", payload.code);
                        break;
                    }
                    _ => {}
                }
            }
        });

        Ok(pid)
    }

    pub async fn stop(&self) -> Result<()> {
        let mut guard = self.child.lock().await;
        let Some(child) = guard.take() else {
            return Ok(());
        };
        child.kill().map_err(|e| anyhow!("kill failed: {e}"))?;
        Ok(())
    }

    pub async fn status(&self) -> DaemonStatus {
        let guard = self.child.lock().await;
        match guard.as_ref() {
            Some(child) => DaemonStatus {
                running: true,
                pid: Some(child.pid()),
            },
            None => DaemonStatus {
                running: false,
                pid: None,
            },
        }
    }
}

pub fn get(app: &AppHandle) -> Arc<DaemonSupervisor> {
    app.state::<Arc<DaemonSupervisor>>().inner().clone()
}

fn pid_file_path() -> Option<PathBuf> {
    let dir = if cfg!(windows) {
        PathBuf::from(std::env::var("APPDATA").ok()?)
    } else {
        PathBuf::from(std::env::var("HOME").ok()?).join(".config")
    };
    Some(dir.join("claude-code-provider-gateway").join("daemon.pid"))
}

fn kill_stale_daemon() {
    let Some(path) = pid_file_path() else {
        return;
    };
    let Ok(content) = std::fs::read_to_string(&path) else {
        return;
    };
    let Ok(pid) = content.trim().parse::<u32>() else {
        return;
    };
    if pid == 0 {
        return;
    }

    log::warn!("found stale daemon pid={pid}, terminating");

    #[cfg(unix)]
    {
        let pid_str = pid.to_string();
        let _ = std::process::Command::new("kill")
            .args(["-TERM", &pid_str])
            .status();
        // Give it half a second to exit gracefully, then force.
        std::thread::sleep(std::time::Duration::from_millis(500));
        let _ = std::process::Command::new("kill")
            .args(["-KILL", &pid_str])
            .status();
    }

    #[cfg(windows)]
    {
        let _ = std::process::Command::new("taskkill")
            .args(["/PID", &pid.to_string(), "/F"])
            .output();
        std::thread::sleep(std::time::Duration::from_millis(200));
    }

    let _ = std::fs::remove_file(&path);
}
