//! Graph cache for tracking current state and detecting changes.
//!
//! The cache stores the current graph state including file paths, wiki-links,
//! and phantom node information. This enables efficient delta calculation when
//! files are modified.

use std::collections::{HashMap, HashSet};
use std::path::{Path, PathBuf};

use crate::graph::GraphData;
use crate::scanner::MarkdownFile;
use crate::parser::parse_markdown;

/// Cache for tracking graph state and detecting changes.
///
/// Maintains mappings between file names, paths, and their wiki-links to enable
/// efficient delta calculation when files change.
#[derive(Debug, Default)]
pub struct GraphCache {
    /// file_name -> file_path mapping
    files: HashMap<String, PathBuf>,

    /// file_name -> outgoing wiki_links
    links: HashMap<String, Vec<String>>,

    /// file_name -> hashtags
    hashtags: HashMap<String, Vec<String>>,

    /// Set of phantom node IDs (referenced but non-existent files)
    phantoms: HashSet<String>,
}

impl GraphCache {
    /// Creates an empty graph cache.
    pub fn new() -> Self {
        Self::default()
    }

    /// Creates a cache from existing graph data and markdown files.
    ///
    /// Initializes the cache with the current state of the graph, extracting
    /// links and hashtags from the provided files.
    ///
    /// # Arguments
    ///
    /// * `graph` - Current graph data with nodes and edges
    /// * `files` - Markdown files that were scanned
    pub fn from_graph_data(graph: &GraphData, files: &[MarkdownFile]) -> Self {
        let mut cache = Self::new();

        // Build file -> path mapping and extract links
        for file in files {
            let parsed = parse_markdown(&file.content);
            cache.files.insert(file.name.clone(), file.path.clone());
            cache.links.insert(file.name.clone(), parsed.wiki_links);
            cache.hashtags.insert(file.name.clone(), parsed.hashtags);
        }

        // Identify phantom nodes
        for node in &graph.nodes {
            if node.group.as_deref() == Some("phantom") {
                cache.phantoms.insert(node.id.clone());
            }
        }

        cache
    }

    /// Checks if a file exists in the cache by its path.
    pub fn has_file_by_path(&self, path: &Path) -> bool {
        let name = path
            .file_stem()
            .and_then(|s| s.to_str())
            .unwrap_or("");

        self.files.contains_key(name)
    }

    /// Checks if a node (file or phantom) exists.
    pub fn node_exists(&self, id: &str) -> bool {
        self.files.contains_key(id)
    }

    /// Checks if a node is a phantom node.
    pub fn is_phantom(&self, id: &str) -> bool {
        self.phantoms.contains(id)
    }

    /// Gets the outgoing wiki-links for a file.
    pub fn get_links(&self, file_name: &str) -> Vec<String> {
        self.links.get(file_name).cloned().unwrap_or_default()
    }

    /// Counts incoming links to a target node.
    ///
    /// Iterates through all files to count how many link to the target.
    pub fn count_incoming_links(&self, target: &str) -> usize {
        self.links
            .values()
            .filter(|links| links.contains(&target.to_string()))
            .count()
    }

    /// Adds a new file to the cache.
    ///
    /// # Arguments
    ///
    /// * `name` - File name (without extension)
    /// * `path` - Full file path
    /// * `links` - Outgoing wiki-links
    /// * `tags` - Hashtags found in the file
    pub fn add_file(&mut self, name: &str, path: &Path, links: &[String], tags: &[String]) {
        self.files.insert(name.to_string(), path.to_path_buf());
        self.links.insert(name.to_string(), links.to_vec());
        self.hashtags.insert(name.to_string(), tags.to_vec());

        // If this was a phantom node, it's now real
        self.phantoms.remove(name);
    }

    /// Updates the wiki-links for an existing file.
    pub fn update_links(&mut self, name: &str, links: &[String]) {
        self.links.insert(name.to_string(), links.to_vec());
    }

    /// Updates the hashtags for an existing file.
    pub fn update_hashtags(&mut self, name: &str, tags: &[String]) {
        self.hashtags.insert(name.to_string(), tags.to_vec());
    }

    /// Removes a file from the cache.
    pub fn remove_file(&mut self, name: &str) {
        self.files.remove(name);
        self.links.remove(name);
        self.hashtags.remove(name);
    }

    /// Adds a phantom node to the cache.
    pub fn add_phantom(&mut self, id: &str) {
        self.phantoms.insert(id.to_string());
    }

    /// Removes a phantom node from the cache.
    pub fn remove_phantom(&mut self, id: &str) {
        self.phantoms.remove(id);
    }

    /// Gets all file names in the cache.
    pub fn get_all_file_names(&self) -> Vec<String> {
        self.files.keys().cloned().collect()
    }
}
