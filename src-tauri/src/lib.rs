//! Main library module for the mdgraph2 Tauri application.
//!
//! This module serves as the entry point for the Tauri application, configuring
//! the application window, loading configuration, and registering command handlers
//! for frontend-backend communication.
//!
//! # Architecture
//!
//! The application follows a modular architecture with the following components:
//! - `scanner`: File system scanning for markdown files
//! - `parser`: Markdown parsing for wiki-links and hashtags
//! - `graph`: Graph construction from parsed markdown files
//! - `commands`: Tauri command handlers exposed to the frontend
//! - `config`: Configuration management with CLI and JSON file support
//! - `helpers`: Template variable replacement utilities
//! - `templates`: Template loading and file creation from templates

mod scanner;
mod parser;
mod graph;
mod commands;
mod config;
mod helpers;
mod templates;
mod watcher;

use commands::{
    create_phantom_node, get_config, open_file, read_note, scan_folder,
};
use config::{load_config, AppState};
use graph::build_graph;
use scanner::scan_directory;
use watcher::GraphCache;
use tauri::Manager;

/// Initializes and runs the Tauri application.
///
/// This function performs the following initialization steps:
/// 1. Configures the main window with transparency and acrylic effects (Windows only)
/// 2. Loads application configuration from CLI arguments or JSON files
/// 3. Registers command handlers for frontend-backend communication
/// 4. Starts the Tauri runtime
///
/// # Platform-Specific Behavior
///
/// On Windows:
/// - Disables window decorations for a custom chrome experience
/// - Applies Windows Acrylic blur effect for semi-transparent background
///
/// # Configuration Loading
///
/// The configuration is loaded with the following priority:
/// 1. CLI arguments (highest priority)
/// 2. `--config` specified JSON file
/// 3. `./config.json` in executable directory or current working directory
/// 4. Default configuration (fallback)
///
/// If configuration loading fails, the application continues with default values
/// and logs the error to stderr.
///
/// # Registered Commands
///
/// The following Tauri commands are exposed to the frontend:
/// - `scan_folder`: Scans a directory for markdown files and builds a graph
/// - `get_config`: Retrieves the current application configuration
/// - `open_file`: Opens a file in the nvim editor
/// - `create_phantom_node`: Creates a markdown file from a phantom node using a template
///
/// # Panics
///
/// Panics if the Tauri application fails to initialize or run. This is typically
/// caused by system-level issues or invalid Tauri configuration.
///
/// # Entry Point
///
/// This function is marked as a mobile entry point for cross-platform compilation,
/// allowing the same codebase to be used for desktop and mobile targets.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            #[cfg(target_os = "windows")]
            {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.set_decorations(false);

                    let _ = window.set_effects(tauri::window::EffectsBuilder::new()
                        .effect(tauri::window::Effect::Acrylic)
                        .state(tauri::window::EffectState::Active)
                        .build());

                    println!("[Window] Decorations disabled, Acrylic effect applied");
                }
            }

            let config = load_config().unwrap_or_else(|e| {
                eprintln!("[Error] Failed to load configuration: {}", e);
                eprintln!("[Info] Using empty configuration");
                config::AppConfig::default()
            });

            // Build initial graph cache if root_dir is configured
            let app_state = if let Some(ref root_dir) = config.root_dir {
                match scan_directory(root_dir) {
                    Ok(files) => {
                        let graph = build_graph(files.clone());
                        let cache = GraphCache::from_graph_data(&graph, &files);
                        println!("[Init] Built graph cache with {} files", files.len());
                        AppState::with_cache(config.clone(), cache)
                    }
                    Err(e) => {
                        eprintln!("[Error] Failed to scan directory for cache: {}", e);
                        AppState::new(config.clone())
                    }
                }
            } else {
                AppState::new(config.clone())
            };

            app.manage(app_state);

            // Start file watcher if root_dir is configured
            if let Some(ref root_dir) = config.root_dir {
                if let Err(e) = watcher::start_watching(app.handle().clone(), root_dir) {
                    eprintln!("[Error] Failed to start file watcher: {}", e);
                }
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            scan_folder,
            get_config,
            open_file,
            create_phantom_node,
            read_note
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
