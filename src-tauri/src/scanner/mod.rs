//! File system scanning module for markdown files.
//!
//! This module provides functionality to recursively scan directories for markdown
//! files (.md extension), reading their contents and metadata. It is designed to be
//! robust against file system errors and handles Unicode file names correctly.
//!
//! # Performance
//!
//! The scanner reads all markdown files into memory during scanning. For large
//! note collections (thousands of files), this may consume significant memory.
//! The recursive directory traversal is depth-first and single-threaded.

use std::fs;
use std::path::{Path, PathBuf};

/// Represents a discovered markdown file with its metadata and content.
///
/// Contains all information needed for subsequent parsing and graph construction.
/// The structure is cloneable for easy value passing and debugging support.
///
/// # Fields
///
/// * `path` - Full absolute path to the markdown file on the file system
/// * `content` - Complete UTF-8 file content as a string
/// * `name` - File name without extension (stem), used as node identifier in the graph
#[derive(Debug, Clone)]
pub struct MarkdownFile {
    pub path: PathBuf,
    pub content: String,
    pub name: String,
}

/// Scans a directory recursively for all markdown files.
///
/// Traverses the directory tree starting from the specified path, collecting all
/// files with a `.md` extension. For each markdown file, reads the complete content
/// and extracts the file name (without extension) for use as a node identifier.
///
/// # Arguments
///
/// * `dir_path` - String path to the directory to scan (can be relative or absolute)
///
/// # Returns
///
/// * `Ok(Vec<MarkdownFile>)` - Vector of all discovered markdown files with their contents
/// * `Err(String)` - Descriptive error message if scanning fails
///
/// # Errors
///
/// Returns an error if:
/// - The specified path does not exist
/// - The specified path is not a directory (e.g., it's a file)
/// - A directory cannot be read due to permissions or I/O errors
/// - A markdown file cannot be read (permissions, encoding issues, etc.)
///
/// # Performance
///
/// Time complexity: O(n) where n is the total number of files in the directory tree.
/// Space complexity: O(m * s) where m is the number of markdown files and s is their
/// average size, as all file contents are loaded into memory.
pub fn scan_directory(dir_path: &str) -> Result<Vec<MarkdownFile>, String> {
    let path = Path::new(dir_path);

    if !path.exists() {
        return Err(format!("Path does not exist: {}", dir_path));
    }

    if !path.is_dir() {
        return Err(format!("Path is not a directory: {}", dir_path));
    }

    let mut files = Vec::new();
    scan_dir_recursive(path, &mut files)?;

    Ok(files)
}

/// Internal recursive helper for directory traversal.
///
/// Performs depth-first traversal of the directory tree, accumulating markdown files
/// in the provided vector. This function is called recursively for each subdirectory
/// encountered.
///
/// # Arguments
///
/// * `dir` - Current directory path being scanned
/// * `files` - Mutable vector accumulating discovered markdown files
///
/// # Returns
///
/// * `Ok(())` - Successfully scanned the directory and all subdirectories
/// * `Err(String)` - Descriptive error message if any I/O operation fails
///
/// # Errors
///
/// Returns an error if:
/// - The directory cannot be read (permissions, I/O errors)
/// - An entry in the directory cannot be accessed
/// - A markdown file cannot be read or contains invalid UTF-8
///
/// # Unicode Handling
///
/// File names are extracted as UTF-8 strings. Files with non-UTF-8 names will use
/// "unknown" as their name identifier, allowing the scan to continue rather than fail.
fn scan_dir_recursive(dir: &Path, files: &mut Vec<MarkdownFile>) -> Result<(), String> {
    let entries = fs::read_dir(dir)
        .map_err(|e| format!("Error reading directory {:?}: {}", dir, e))?;

    for entry in entries {
        let entry = entry.map_err(|e| format!("Error reading entry: {}", e))?;
        let path = entry.path();

        if path.is_dir() {
            scan_dir_recursive(&path, files)?;
        } else if path.is_file() {
            if let Some(extension) = path.extension() {
                if extension == "md" {
                    let content = fs::read_to_string(&path)
                        .map_err(|e| format!("Error reading file {:?}: {}", path, e))?;

                    let name = path
                        .file_stem()
                        .and_then(|s| s.to_str())
                        .unwrap_or("unknown")
                        .to_string();

                    files.push(MarkdownFile {
                        path: path.clone(),
                        content,
                        name,
                    });
                }
            }
        }
    }

    Ok(())
}
