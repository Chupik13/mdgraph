//! File system watcher module for real-time graph updates.
//!
//! This module monitors the root directory for markdown file changes and emits
//! delta events when files are created, modified, or deleted. It uses the `notify`
//! crate with debouncing to group rapid file system events.
//!
//! # Architecture
//!
//! The watcher runs in a separate thread, processing file system events and
//! comparing them against the cached graph state to compute deltas. Events are
//! emitted to the frontend via Tauri's event system.
//!
//! # Event Flow
//!
//! 1. File system change detected by `notify`
//! 2. Event debounced (300ms) to group rapid changes
//! 3. Delta calculated by comparing with cached state
//! 4. Individual events emitted to frontend (node-added, edge-removed, etc.)

mod cache;
mod delta;
mod events;

pub use cache::GraphCache;

use notify_debouncer_mini::{new_debouncer, DebouncedEvent, DebouncedEventKind};
use notify::RecursiveMode;
use std::path::Path;
use std::sync::mpsc::channel;
use std::time::Duration;
use tauri::{AppHandle, Manager};

use crate::config::AppState;
use crate::scanner::MarkdownFile;

/// Starts watching the root directory for file changes.
///
/// Creates a debounced file system watcher that monitors the specified directory
/// for markdown file changes. When changes are detected, it calculates the delta
/// and emits events to the frontend.
///
/// # Arguments
///
/// * `app_handle` - Tauri application handle for emitting events
/// * `root_dir` - Path to the root directory to watch
///
/// # Returns
///
/// * `Ok(())` - Watcher started successfully
/// * `Err(String)` - Error message if watcher creation fails
///
/// # Thread Safety
///
/// The watcher runs in a dedicated thread. Graph cache access is synchronized
/// via the AppState's mutex.
pub fn start_watching(app_handle: AppHandle, root_dir: &str) -> Result<(), String> {
    let root_path = Path::new(root_dir).to_path_buf();
    let (tx, rx) = channel();

    // Debounce: 300ms delay to group rapid changes (e.g., editor save operations)
    let mut debouncer = new_debouncer(Duration::from_millis(300), tx)
        .map_err(|e| format!("Failed to create file watcher: {}", e))?;

    debouncer
        .watcher()
        .watch(&root_path, RecursiveMode::Recursive)
        .map_err(|e| format!("Failed to watch directory: {}", e))?;

    println!("[Watcher] Started watching: {}", root_dir);

    // Spawn watcher thread
    let handle = app_handle.clone();
    std::thread::spawn(move || {
        // Keep debouncer alive for the lifetime of this thread
        let _debouncer = debouncer;

        for result in rx {
            match result {
                Ok(events) => {
                    process_events(&handle, events);
                }
                Err(e) => {
                    eprintln!("[Watcher] Error receiving events: {:?}", e);
                }
            }
        }

        println!("[Watcher] Watcher thread terminated");
    });

    Ok(())
}

/// Processes a batch of debounced file system events.
///
/// Filters events to only handle markdown files, determines the type of change
/// (create, modify, delete), calculates the delta, and emits events.
fn process_events(app: &AppHandle, events: Vec<DebouncedEvent>) {
    let state = app.state::<AppState>();

    for event in events {
        // Only process .md files
        let is_markdown = event
            .path
            .extension()
            .map_or(false, |ext| ext == "md");

        if !is_markdown {
            continue;
        }

        println!("[Watcher] Processing event for: {:?}", event.path);

        let delta_result = {
            let mut cache = state.graph_cache.lock().unwrap();

            match event.kind {
                DebouncedEventKind::Any => {
                    if event.path.exists() {
                        // File exists - either created or modified
                        if cache.has_file_by_path(&event.path) {
                            delta::handle_file_modified(&event.path, &mut cache)
                        } else {
                            delta::handle_file_created(&event.path, &mut cache)
                        }
                    } else {
                        // File doesn't exist - deleted
                        delta::handle_file_deleted(&event.path, &mut cache)
                    }
                }
                DebouncedEventKind::AnyContinuous => {
                    // Continuous events during file modifications - skip
                    continue;
                }
                _ => {
                    // Handle any future variants of the non-exhaustive enum
                    continue;
                }
            }
        };

        match delta_result {
            Ok(delta) => {
                if !delta.is_empty() {
                    println!("[Watcher] Emitting delta: {:?}", delta);
                    events::emit_delta(app, delta);
                }
            }
            Err(e) => {
                eprintln!("[Watcher] Error processing file {:?}: {}", event.path, e);
            }
        }
    }
}

/// Reads a markdown file and returns its content.
///
/// Helper function for reading file content during delta calculation.
pub fn read_markdown_file(path: &Path) -> Result<MarkdownFile, String> {
    let content = std::fs::read_to_string(path)
        .map_err(|e| format!("Error reading file {:?}: {}", path, e))?;

    let name = path
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("unknown")
        .to_string();

    Ok(MarkdownFile {
        path: path.to_path_buf(),
        content,
        name,
    })
}
