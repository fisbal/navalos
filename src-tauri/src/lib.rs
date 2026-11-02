// NavalOS for Windows and Mac: the same NavalOS page (built into ../dist) in the system's web view,
// under the MartinB gold title bar (bar.js: crest, name, minimize / maximize / close) like every MartinB app.
// On start it looks for a newer GitHub Release; if there is one it installs it and reopens, keeping your progress.
use tauri::{WebviewWindow, WebviewWindowBuilder};
use tauri_plugin_updater::UpdaterExt;

const BAR_JS: &str = include_str!("bar.js");

// The gold bar's buttons. Returns the window state so the maximize icon can follow it.
#[tauri::command]
fn mb_window(window: WebviewWindow, action: String) -> String {
  let _ = match action.as_str() {
    "minimize" => window.minimize(),
    "toggle_maximize" => {
      if window.is_maximized().unwrap_or(false) { window.unmaximize() } else { window.maximize() }
    }
    "close" => window.close(),
    "drag" => window.start_dragging(),
    _ => Ok(()),
  };
  if window.is_maximized().unwrap_or(false) { "maximized".into() } else { "normal".into() }
}

pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_updater::Builder::new().build())
    .invoke_handler(tauri::generate_handler![mb_window])
    .setup(|app| {
      // The main window comes from tauri.conf.json ("create": false there), opened here so the gold bar is added to it.
      let cfg = app
        .config()
        .app
        .windows
        .iter()
        .find(|w| w.label == "main")
        .cloned()
        .expect("main window missing from tauri.conf.json");
      WebviewWindowBuilder::from_config(app.handle(), &cfg)?
        .initialization_script(BAR_JS)
        .build()?;

      let handle = app.handle().clone();
      tauri::async_runtime::spawn(async move {
        // Offline, or no newer version: carry on.
        let _ = update(handle).await;
      });
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running NavalOS");
}

async fn update(app: tauri::AppHandle) -> tauri_plugin_updater::Result<()> {
  if let Some(update) = app.updater()?.check().await? {
    update.download_and_install(|_, _| {}, || {}).await?;
    app.restart();
  }
  Ok(())
}
