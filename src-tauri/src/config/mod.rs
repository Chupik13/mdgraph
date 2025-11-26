//! Configuration management module for the mdgraph2 application.
//!
//! This module provides a hierarchical configuration system that supports multiple
//! configuration sources with proper priority handling:
//! 1. CLI arguments (highest priority)
//! 2. `--config` specified JSON file
//! 3. `./config.json` in executable directory or current working directory
//! 4. Default values (lowest priority)
//!
//! # Configuration Flow
//!
//! The configuration loading process merges values from different sources, with
//! CLI arguments overriding file-based configuration. The final merged configuration
//! is stored in thread-safe `AppState` for access across the application.
//!
//! # Thread Safety
//!
//! The `AppState` struct wraps configuration in an `Arc<Mutex<>>` to provide safe
//! concurrent access from multiple Tauri command handlers.

use clap::Parser;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};

use crate::watcher::GraphCache;
/// Previewer-specific configuration.
///
/// Contains settings related to the markdown preview feature.
///
/// # Fields
///
/// * `offset` - Number of lines to skip from the beginning of the file when displaying preview.
///   Useful for skipping frontmatter or headers. Default is 0.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct PreviewerConfig {
    #[serde(default)]
    pub offset: usize,
}

/// Application configuration structure.
///
/// Contains all configurable parameters for the mdgraph2 application. This structure
/// is serializable for JSON file persistence and cloneable for value passing.
///
/// # Fields
///
/// * `root_dir` - Optional path to the root directory containing markdown files to scan.
///   If None, the application may prompt the user or use a default location.
/// * `template_phantom_node` - Optional path to the template file used for creating phantom nodes.
///   When a phantom node is converted to a real file, this template is used as the base content.
/// * `previewer` - Configuration for the markdown preview feature.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub root_dir: Option<String>,
    pub template_phantom_node: Option<String>,
    #[serde(default)]
    pub previewer: PreviewerConfig,
}

impl Default for AppConfig {
    /// Creates a default configuration with all fields set to None/default.
    ///
    /// This serves as the fallback when no configuration file is found and no
    /// CLI arguments are provided.
    fn default() -> Self {
        Self {
            root_dir: None,
            template_phantom_node: None,
            previewer: PreviewerConfig::default(),
        }
    }
}

/// Command-line arguments structure.
///
/// Defines the CLI interface using clap's derive macros. Arguments provided via
/// CLI take precedence over configuration file values.
///
/// # Arguments
///
/// * `--config <FILE>` - Path to a JSON configuration file to load
/// * `--root-dir <DIR>` - Root directory containing markdown files to scan
/// * `--template-phantom-node <FILE>` - Path to the template file for creating phantom nodes
#[derive(Parser)]
pub struct CliArgs {
    #[arg(long, value_name = "FILE")]
    pub config: Option<PathBuf>,
    #[arg(long, value_name = "DIR")]
    pub root_dir: Option<String>,
    #[arg(long, value_name = "FILE")]
    pub template_phantom_node: Option<String>,
}

/// Thread-safe application state container.
///
/// Manages application configuration and graph cache with thread-safe access patterns
/// using `Arc<Mutex<>>`. This allows multiple Tauri command handlers to safely read
/// and update state concurrently.
///
/// # Thread Safety
///
/// Both the configuration and graph cache are protected by mutexes, ensuring exclusive
/// access during reads and writes. The `Arc` wrapper allows the state to be shared
/// across threads without copying the entire state.
#[derive(Debug, Clone)]
pub struct AppState {
    pub config: Arc<Mutex<AppConfig>>,
    pub graph_cache: Arc<Mutex<GraphCache>>,
}

impl AppState {
    /// Creates a new AppState with the provided configuration and an empty graph cache.
    ///
    /// Wraps the configuration and cache in `Arc<Mutex<>>` for thread-safe access.
    ///
    /// # Arguments
    ///
    /// * `config` - The initial application configuration
    ///
    /// # Returns
    ///
    /// A new `AppState` instance ready for use in Tauri's managed state system.
    pub fn new(config: AppConfig) -> Self {
        Self {
            config: Arc::new(Mutex::new(config)),
            graph_cache: Arc::new(Mutex::new(GraphCache::new())),
        }
    }

    /// Creates a new AppState with the provided configuration and graph cache.
    ///
    /// # Arguments
    ///
    /// * `config` - The initial application configuration
    /// * `cache` - Pre-populated graph cache
    ///
    /// # Returns
    ///
    /// A new `AppState` instance with the provided cache.
    pub fn with_cache(config: AppConfig, cache: GraphCache) -> Self {
        Self {
            config: Arc::new(Mutex::new(config)),
            graph_cache: Arc::new(Mutex::new(cache)),
        }
    }

    /// Retrieves a clone of the current configuration.
    ///
    /// Acquires the mutex lock, clones the configuration, and returns it.
    /// This provides a snapshot of the current configuration state.
    ///
    /// # Returns
    ///
    /// A cloned copy of the current `AppConfig`.
    ///
    /// # Panics
    ///
    /// Panics if the mutex is poisoned (another thread panicked while holding the lock).
    pub fn get_config(&self) -> AppConfig {
        self.config.lock().unwrap().clone()
    }

    /// Updates the application configuration.
    ///
    /// Acquires the mutex lock and replaces the current configuration with the
    /// provided one. This operation is atomic from the perspective of other threads.
    ///
    /// # Arguments
    ///
    /// * `config` - The new configuration to set
    ///
    /// # Panics
    ///
    /// Panics if the mutex is poisoned (another thread panicked while holding the lock).
    pub fn update_config(&self, config: AppConfig) {
        *self.config.lock().unwrap() = config;
    }
}

impl AppConfig {
    /// Loads configuration from a JSON file.
    ///
    /// Reads the file at the specified path and deserializes it into an `AppConfig`
    /// structure. All fields in the JSON file are optional - missing fields will
    /// be set to None.
    ///
    /// # Arguments
    ///
    /// * `path` - Path to the JSON configuration file
    ///
    /// # Returns
    ///
    /// * `Ok(AppConfig)` - Successfully loaded and parsed configuration
    /// * `Err(String)` - Error message if file reading or JSON parsing fails
    ///
    /// # Errors
    ///
    /// Returns an error if:
    /// - The file cannot be read (doesn't exist, permission denied, etc.)
    /// - The file contains invalid JSON syntax
    /// - The JSON structure doesn't match the expected schema
    pub fn from_file(path: &PathBuf) -> Result<Self, String> {
        let content = fs::read_to_string(path)
            .map_err(|e| format!("Error reading configuration file: {}", e))?;

        let config: AppConfig = serde_json::from_str(&content)
            .map_err(|e| format!("Error parsing JSON configuration: {}", e))?;

        Ok(config)
    }

    /// Creates configuration from CLI arguments.
    ///
    /// Extracts configuration values from parsed command-line arguments.
    /// Only the `root_dir` argument is currently mapped; the `config` argument
    /// is used for file loading and not stored in the configuration itself.
    ///
    /// # Arguments
    ///
    /// * `args` - Parsed CLI arguments structure
    ///
    /// # Returns
    ///
    /// A new `AppConfig` with values populated from CLI arguments.
    pub fn from_cli(args: &CliArgs) -> Self {
        Self {
            root_dir: args.root_dir.clone(),
            template_phantom_node: args.template_phantom_node.clone(),
            previewer: PreviewerConfig::default(),
        }
    }

    /// Merges two configurations with priority handling.
    ///
    /// Combines a base configuration with an override configuration, where the
    /// override takes precedence. For each field, if the override contains a
    /// value (Some), it is used; otherwise, the base value is used.
    ///
    /// This implements the configuration hierarchy: CLI arguments override
    /// file-based configuration, which overrides defaults.
    ///
    /// # Arguments
    ///
    /// * `base` - The lower-priority configuration (e.g., from file or defaults)
    /// * `override_config` - The higher-priority configuration (e.g., from CLI)
    ///
    /// # Returns
    ///
    /// A new `AppConfig` with merged values according to the priority rules.
    pub fn merge(base: Self, override_config: Self) -> Self {
        Self {
            root_dir: override_config.root_dir.or(base.root_dir),
            template_phantom_node: override_config.template_phantom_node.or(base.template_phantom_node),
            previewer: base.previewer, // Previewer config comes from file only
        }
    }
}

/// Loads and merges configuration from all available sources.
///
/// This is the main entry point for configuration loading. It orchestrates the
/// complete configuration loading and merging process following this priority order:
/// 1. Parse CLI arguments
/// 2. Load JSON configuration (from --config path or default locations)
/// 3. Merge CLI arguments over JSON configuration
/// 4. Return the final merged configuration
///
/// The function also logs the configuration loading process and final values to
/// stdout for debugging purposes.
///
/// # Returns
///
/// * `Ok(AppConfig)` - Successfully loaded and merged configuration
/// * `Err(String)` - Error message if a specified configuration file fails to load
///
/// # Errors
///
/// Returns an error if:
/// - The `--config` specified file fails to load or parse
/// - Note: Missing default config.json is NOT an error - it falls back to defaults
///
/// # Configuration Search Locations
///
/// When no `--config` is specified, searches for config.json in:
/// 1. Directory containing the executable
/// 2. Current working directory
///
/// If no configuration file is found, uses default values.
pub fn load_config() -> Result<AppConfig, String> {
    let args = CliArgs::parse();

    let json_config = if let Some(config_path) = &args.config {
        println!("[Config] Loading configuration from: {:?}", config_path);
        AppConfig::from_file(config_path)?
    } else {
        match try_load_default_config() {
            Some(config) => {
                println!("[Config] Loaded configuration from ./config.json");
                config
            }
            None => {
                println!("[Config] config.json not found, using defaults");
                AppConfig::default()
            }
        }
    };

    let cli_config = AppConfig::from_cli(&args);

    let final_config = AppConfig::merge(json_config, cli_config);

    println!("[Config] Final configuration:");
    println!("  root_dir: {:?}", final_config.root_dir);
    println!("  template_phantom_node: {:?}", final_config.template_phantom_node);
    println!("  previewer.offset: {:?}", final_config.previewer.offset);

    Ok(final_config)
}

/// Attempts to automatically locate and load a default config.json file.
///
/// Searches for config.json in standard locations without requiring explicit
/// CLI specification. This provides a convenient way to configure the application
/// without command-line arguments.
///
/// # Search Order
///
/// 1. `<executable_directory>/config.json` - Checked first, useful for portable installations
/// 2. `<current_working_directory>/config.json` - Checked second, useful for development
///
/// # Returns
///
/// * `Some(AppConfig)` - Successfully found and loaded a configuration file
/// * `None` - No configuration file found in any of the search locations
///
/// # Error Handling
///
/// If a config.json file is found but fails to parse, the error is silently ignored
/// and None is returned. This allows the application to fall back to defaults even
/// when a malformed configuration file is present. The calling function will log
/// that defaults are being used.
fn try_load_default_config() -> Option<AppConfig> {
    let exe_path = std::env::current_exe().ok()?;
    let exe_dir = exe_path.parent()?;

    let config_path = exe_dir.join("config.json");

    if config_path.exists() {
        println!("[Config] Found config.json: {:?}", config_path);
        AppConfig::from_file(&config_path).ok()
    } else {
        let cwd_config = PathBuf::from("config.json");
        if cwd_config.exists() {
            println!("[Config] Found config.json in current directory: {:?}", cwd_config);
            AppConfig::from_file(&cwd_config).ok()
        } else {
            None
        }
    }
}
