mod commands;
mod config;
mod daemon_supervisor;
mod external_url;
mod master_key;

use daemon_supervisor::DaemonSupervisor;
use std::sync::Arc;
use tauri::{AppHandle, Manager, RunEvent};

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_process::init())
        .manage(DaemonSupervisor::new())
        .setup(|app| {
            let handle = app.handle().clone();
            if config::uses_external_daemon() {
                log::info!("using external dev daemon; sidecar autostart disabled");
                return Ok(());
            }

            // Autostart the daemon on app launch — delivers the "install and
            // it just works" promise. Failures are logged but don't abort the
            // shell: user can still retry via the panel button.
            tauri::async_runtime::spawn(async move {
                if let Err(err) = autostart(&handle).await {
                    log::error!("daemon autostart failed: {err}");
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::start_daemon,
            commands::stop_daemon,
            commands::daemon_status,
            commands::open_url,
        ])
        .build(tauri::generate_context!())
        .expect("failed to build Tauri app")
        .run(|app, event| {
            if let RunEvent::ExitRequested { .. } = event {
                // Best-effort sync shutdown so we don't leave the sidecar
                // orphaned. Tokio runtime is gone by Exit, so we block here.
                let supervisor: Arc<DaemonSupervisor> =
                    app.state::<Arc<DaemonSupervisor>>().inner().clone();
                tauri::async_runtime::block_on(async move {
                    let _ = supervisor.stop().await;
                });
            }
        });
}

async fn autostart(app: &AppHandle) -> anyhow::Result<()> {
    let key = master_key::get_or_create_hex()?;
    daemon_supervisor::get(app).start(app, &key).await?;
    Ok(())
}
