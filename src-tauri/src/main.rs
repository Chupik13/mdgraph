//! Binary entry point for the mdgraph2 Tauri application.
//!
//! This module serves as the minimal executable wrapper that delegates to the
//! main library implementation. The windows_subsystem attribute ensures the
//! application runs without a console window in release builds on Windows.

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

/// Application entry point.
///
/// Immediately delegates to the library's `run()` function which handles all
/// initialization and application logic.
///
/// # Platform-Specific Behavior
///
/// On Windows in release builds (non-debug), this binary runs as a GUI application
/// without spawning a console window, providing a cleaner user experience.
fn main() {
    mdgraph2_lib::run()
}
