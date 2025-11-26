//! Tauri command handlers for frontend-backend communication.
//!
//! This module defines all Tauri commands that can be invoked from the frontend
//! JavaScript/TypeScript code. Commands provide a type-safe RPC (Remote Procedure Call)
//! interface between the web view and the Rust backend.
//!
//! # Command Registration
//!
//! All functions marked with `#[tauri::command]` must be registered in the Tauri
//! builder's `invoke_handler` macro in `lib.rs`.
//!
//! # Error Handling
//!
//! Commands return `Result<T, String>` where the error string is sent to the frontend
//! as a rejected promise. The frontend should handle these errors appropriately.
//!
//! # Threading
//!
//! Tauri commands run on a thread pool, so they can safely perform blocking I/O
//! operations without freezing the UI. However, long-running operations should
//! still consider emitting progress events.

use crate::config::{AppConfig, AppState};
use crate::graph::{scan_and_build_graph, GraphData};
use crate::templates;
use std::path::PathBuf;
use std::process::Command;
use tauri::State;

/// Scans a directory for markdown files and builds a graph.
///
/// This command performs a complete scan of the specified directory, parsing all
/// markdown files and constructing a graph of wiki-link connections. It's typically
/// called when the application starts or when the user changes the root directory.
///
/// # Arguments
///
/// * `path` - File system path to the directory containing markdown files
///
/// # Returns
///
/// * `Ok(GraphData)` - Complete graph with all nodes and edges
/// * `Err(String)` - Error message describing what went wrong
///
/// # Errors
///
/// Returns an error if:
/// - The specified path doesn't exist or isn't accessible
/// - File system permissions prevent reading directories or files
/// - Any markdown file contains invalid UTF-8 encoding
///
/// # Performance
///
/// This operation is blocking and can take several seconds for large note collections
/// (thousands of files). The frontend should show a loading indicator while this
/// command executes.
///
/// # Frontend Usage
///
/// ```typescript
/// import { invoke } from '@tauri-apps/api/core';
///
/// const graphData = await invoke('scan_folder', { path: '/path/to/notes' });
/// ```
#[tauri::command]
pub fn scan_folder(path: String) -> Result<GraphData, String> {
    scan_and_build_graph(&path)
}

/// Retrieves the current application configuration.
///
/// Returns a snapshot of the current configuration state, including the root
/// directory and other settings. This is useful for the frontend to display
/// current settings or make decisions based on configuration.
///
/// # Arguments
///
/// * `state` - Tauri managed state containing the application configuration
///
/// # Returns
///
/// A clone of the current `AppConfig` structure.
///
/// # Thread Safety
///
/// This command safely accesses shared state using Tauri's managed state system,
/// which ensures proper synchronization across concurrent command invocations.
///
/// # Frontend Usage
///
/// ```typescript
/// import { invoke } from '@tauri-apps/api/core';
///
/// const config = await invoke('get_config');
/// console.log('Root directory:', config.root_dir);
/// ```
#[tauri::command]
pub fn get_config(state: State<AppState>) -> AppConfig {
    state.get_config()
}

/// Opens a markdown file in the nvim editor by node ID.
///
/// Launches an external nvim process to edit the specified markdown file. This
/// command is typically invoked when the user double-clicks a node in the graph
/// visualization.
///
/// The function constructs the file path from the node ID and root directory.
/// If the file doesn't exist and a phantom node template is configured, the file
/// will be automatically created from the template before opening it in nvim.
///
/// # Arguments
///
/// * `node_id` - The ID/name of the node (without .md extension)
/// * `state` - Tauri managed state containing the application configuration
///
/// # Returns
///
/// * `Ok(())` - Successfully launched nvim (doesn't wait for it to close)
/// * `Err(String)` - Error message if the operation failed
///
/// # Errors
///
/// Returns an error if:
/// - No `root_dir` is configured
/// - The file doesn't exist and no phantom node template is configured
/// - The nvim executable is not found in PATH
/// - Process spawning fails due to system limitations
///
/// # File Path Construction
///
/// The file path is constructed as: `{root_dir}/{node_id}.md`
///
/// # Phantom Node Creation
///
/// When a file doesn't exist:
/// 1. Checks if `template_phantom_node` is configured
/// 2. Creates the file from the template with variable substitution
/// 3. Opens the newly created file in nvim
///
/// # Platform-Specific Behavior
///
/// ## Windows
/// Uses `cmd /C start nvim <file>` to launch nvim in a new window. This allows
/// the nvim process to outlive the parent application window.
///
/// ## Unix/Linux/macOS
/// Directly spawns `nvim <file>` as a child process.
///
/// # Process Management
///
/// The spawned nvim process runs independently of the Tauri application. The
/// command returns immediately after spawning without waiting for nvim to close.
/// This is a fire-and-forget operation.
///
/// # Frontend Usage
///
/// ```typescript
/// import { invoke } from '@tauri-apps/api/core';
///
/// try {
///   await invoke('open_file', { nodeId: 'MyNote' });
///   console.log('Opened file in nvim');
/// } catch (error) {
///   console.error('Failed to open file:', error);
/// }
/// ```
#[tauri::command]
pub fn open_file(node_id: String, state: State<AppState>) -> Result<(), String> {
    println!("[OpenFile] Opening node: {}", node_id);

    let config = state.get_config();

    let root_dir = config
        .root_dir
        .ok_or_else(|| "Root directory not configured".to_string())?;

    let mut file_path = PathBuf::from(&root_dir);
    file_path.push(format!("{}.md", node_id));

    let file_path_str = file_path
        .to_str()
        .ok_or_else(|| "Invalid file path".to_string())?;

    println!("[OpenFile] Resolved file path: {}", file_path_str);

    if !file_path.exists() {
        println!("[OpenFile] File does not exist, attempting to create from template");

        if let Some(template_path) = config.template_phantom_node {
            println!("[OpenFile] Creating file from template: {}", template_path);
            templates::create_from_template(&template_path, file_path_str)?;
            println!("[OpenFile] File created successfully: {}", file_path_str);
        } else {
            return Err(format!(
                "File does not exist and no phantom node template configured: {}",
                file_path_str
            ));
        }
    }

    #[cfg(target_os = "windows")]
    {
        Command::new("cmd")
            .args(&["/C", "start", "nvim", file_path_str])
            .spawn()
            .map_err(|e| format!("Error launching nvim: {}", e))?;
    }

    #[cfg(not(target_os = "windows"))]
    {
        Command::new("nvim")
            .arg(file_path_str)
            .spawn()
            .map_err(|e| format!("Error launching nvim: {}", e))?;
    }

    println!("[OpenFile] File opened in nvim");
    Ok(())
}

/// Creates a markdown file from a phantom node using a template.
///
/// When a phantom node (a referenced but non-existent file) is selected, this
/// command creates a real markdown file for it using the configured template.
/// The template supports variable substitution for dates and week numbers.
///
/// # Arguments
///
/// * `node_name` - Name of the node/file to create (without .md extension)
/// * `state` - Tauri managed state containing the application configuration
///
/// # Returns
///
/// * `Ok(String)` - Full path to the created file
/// * `Err(String)` - Error message describing what went wrong
///
/// # Errors
///
/// Returns an error if:
/// - No `root_dir` is configured (nowhere to create the file)
/// - No `template_phantom_node` is configured (no template to use)
/// - The template file doesn't exist or can't be read
/// - The target file already exists (won't overwrite)
/// - File system permissions prevent file creation
///
/// # Template Variables
///
/// The template file can contain these placeholders:
/// - `{{date}}` - Replaced with current date in YYYY-MM-DD format
/// - `{{week}}` - Replaced with current ISO week number (1-53)
///
/// # Example Template
///
/// ```markdown
/// # {{title}}
///
/// Created: {{date}}
/// Week: {{week}}
///
/// ## Notes
///
/// ```
///
/// # Frontend Usage
///
/// ```typescript
/// import { invoke } from '@tauri-apps/api/core';
///
/// try {
///   const filePath = await invoke('create_phantom_node', {
///     nodeName: 'My New Note'
///   });
///   console.log('Created file:', filePath);
/// } catch (error) {
///   console.error('Failed to create node:', error);
/// }
/// ```
#[tauri::command]
pub fn create_phantom_node(node_name: String, state: State<AppState>) -> Result<String, String> {
    println!("[CreatePhantomNode] Creating node: {}", node_name);

    let config = state.get_config();

    let root_dir = config
        .root_dir
        .ok_or_else(|| "Root directory not configured".to_string())?;

    let template_path = config
        .template_phantom_node
        .ok_or_else(|| "Template for phantom nodes not configured".to_string())?;

    let mut file_path = PathBuf::from(&root_dir);
    file_path.push(format!("{}.md", node_name));

    let file_path_str = file_path
        .to_str()
        .ok_or_else(|| "Invalid file path".to_string())?;

    templates::create_from_template(&template_path, file_path_str)?;

    println!("[CreatePhantomNode] Created file: {}", file_path_str);

    Ok(file_path_str.to_string())
}

/// Reads the content of a markdown note by node ID.
///
/// This command retrieves the raw markdown content of a note file for preview
/// purposes. It constructs the file path from the node ID and root directory,
/// then reads and returns the file content.
///
/// # Arguments
///
/// * `node_id` - The ID/name of the node (without .md extension)
/// * `state` - Tauri managed state containing the application configuration
///
/// # Returns
///
/// * `Ok(String)` - The markdown content of the file
/// * `Err(String)` - Error message if reading fails
///
/// # Errors
///
/// Returns an error if:
/// - No `root_dir` is configured
/// - The file doesn't exist (phantom node)
/// - File reading fails due to permissions or encoding issues
///
/// # Frontend Usage
///
/// ```typescript
/// import { invoke } from '@tauri-apps/api/core';
///
/// const content = await invoke('read_note', { nodeId: 'MyNote' });
/// ```
#[tauri::command]
pub fn read_note(node_id: String, state: State<AppState>) -> Result<String, String> {
    println!("[ReadNote] Reading note: {}", node_id);

    let config = state.get_config();

    let root_dir = config
        .root_dir
        .ok_or_else(|| "Root directory not configured".to_string())?;

    let mut file_path = PathBuf::from(&root_dir);
    file_path.push(format!("{}.md", node_id));

    let file_path_str = file_path
        .to_str()
        .ok_or_else(|| "Invalid file path".to_string())?;

    println!("[ReadNote] Resolved file path: {}", file_path_str);

    if !file_path.exists() {
        return Err(format!("File does not exist: {}", file_path_str));
    }

    let content = std::fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read file: {}", e))?;

    let offset = config.previewer.offset;
    if offset > 0 {
        println!("[ReadNote] Skipping {} lines (offset from config)", offset);
    }

    let result: String = content
        .lines()
        .skip(offset)
        .collect::<Vec<_>>()
        .join("\n");

    Ok(result)
}
