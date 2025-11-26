//! Delta calculation for graph changes.
//!
//! This module compares the current file state with the cached state to determine
//! what graph elements need to be added or removed. It handles the complexity of
//! phantom node management when files are created or deleted.

use std::collections::HashSet;
use std::path::Path;

use crate::graph::{Edge, Node};
use crate::parser::parse_markdown;

use super::cache::GraphCache;
use super::read_markdown_file;

/// Represents changes to be applied to the graph.
///
/// Contains vectors of nodes and edges to add or remove. The frontend uses this
/// information to incrementally update the vis-network visualization.
#[derive(Debug, Default)]
pub struct GraphDelta {
    /// Nodes to add to the graph
    pub nodes_added: Vec<Node>,

    /// Node IDs to remove from the graph
    pub nodes_removed: Vec<String>,

    /// Nodes that were updated (e.g., hashtags changed)
    pub nodes_updated: Vec<Node>,

    /// Edges to add to the graph
    pub edges_added: Vec<Edge>,

    /// Edges to remove from the graph
    pub edges_removed: Vec<Edge>,
}

impl GraphDelta {
    /// Checks if the delta contains any changes.
    pub fn is_empty(&self) -> bool {
        self.nodes_added.is_empty()
            && self.nodes_removed.is_empty()
            && self.nodes_updated.is_empty()
            && self.edges_added.is_empty()
            && self.edges_removed.is_empty()
    }
}

/// Handles a file creation event.
///
/// When a new markdown file is created:
/// 1. If it was a phantom node, remove the phantom
/// 2. Create a real node for the file
/// 3. Create edges for all wiki-links
/// 4. Create phantom nodes for links to non-existent files
///
/// # Arguments
///
/// * `path` - Path to the newly created file
/// * `cache` - Graph cache to update
///
/// # Returns
///
/// * `Ok(GraphDelta)` - Changes to apply to the graph
/// * `Err(String)` - Error message if file reading fails
pub fn handle_file_created(path: &Path, cache: &mut GraphCache) -> Result<GraphDelta, String> {
    let file = read_markdown_file(path)?;
    let parsed = parse_markdown(&file.content);
    let mut delta = GraphDelta::default();

    // Check if this file was a phantom node (someone linked to it before it existed)
    if cache.is_phantom(&file.name) {
        delta.nodes_removed.push(file.name.clone());
        cache.remove_phantom(&file.name);
    }

    // Calculate incoming links from other files
    let incoming_links = cache.count_incoming_links(&file.name);

    // Create the real node
    let node = Node {
        id: file.name.clone(),
        label: file.name.clone(),
        value: incoming_links,
        group: None,
        file_path: path.to_string_lossy().to_string(),
        hashtags: parsed.hashtags.clone(),
    };
    delta.nodes_added.push(node);

    // Create edges for all wiki-links and phantom nodes if needed
    for link in &parsed.wiki_links {
        delta.edges_added.push(Edge {
            from: file.name.clone(),
            to: link.clone(),
        });

        // Create phantom node if the target doesn't exist
        if !cache.node_exists(link) && !cache.is_phantom(link) {
            delta.nodes_added.push(Node::phantom(link));
            cache.add_phantom(link);
        }
    }

    // Update cache
    cache.add_file(&file.name, path, &parsed.wiki_links, &parsed.hashtags);

    Ok(delta)
}

/// Handles a file modification event.
///
/// Compares the old and new wiki-links to determine:
/// - Which edges to add (new links)
/// - Which edges to remove (deleted links)
/// - Which phantom nodes to create (new links to non-existent files)
/// - Which phantom nodes to remove (last link to them was deleted)
///
/// # Arguments
///
/// * `path` - Path to the modified file
/// * `cache` - Graph cache to update
///
/// # Returns
///
/// * `Ok(GraphDelta)` - Changes to apply to the graph
/// * `Err(String)` - Error message if file reading fails
pub fn handle_file_modified(path: &Path, cache: &mut GraphCache) -> Result<GraphDelta, String> {
    let file = read_markdown_file(path)?;
    let parsed = parse_markdown(&file.content);
    let mut delta = GraphDelta::default();

    let old_links: HashSet<String> = cache.get_links(&file.name).into_iter().collect();
    let new_links: HashSet<String> = parsed.wiki_links.iter().cloned().collect();

    // Only process if links actually changed
    if old_links == new_links {
        return Ok(delta);
    }

    // Find removed links
    for link in old_links.difference(&new_links) {
        delta.edges_removed.push(Edge {
            from: file.name.clone(),
            to: link.clone(),
        });

        // Check if phantom node should be removed (no more incoming links)
        if cache.is_phantom(link) {
            let remaining_links = cache.count_incoming_links(link);
            // If this was the only link to the phantom, remove it
            if remaining_links <= 1 {
                delta.nodes_removed.push(link.clone());
                cache.remove_phantom(link);
            }
        }
    }

    // Find added links
    for link in new_links.difference(&old_links) {
        delta.edges_added.push(Edge {
            from: file.name.clone(),
            to: link.clone(),
        });

        // Create phantom node if target doesn't exist
        if !cache.node_exists(link) && !cache.is_phantom(link) {
            delta.nodes_added.push(Node::phantom(link));
            cache.add_phantom(link);
        }
    }

    // Update cache
    cache.update_links(&file.name, &parsed.wiki_links);

    Ok(delta)
}

/// Handles a file deletion event.
///
/// When a markdown file is deleted:
/// 1. Remove all outgoing edges
/// 2. Remove orphaned phantom nodes (that were only linked from this file)
/// 3. Either remove the node entirely, or convert it to phantom if others link to it
///
/// # Arguments
///
/// * `path` - Path to the deleted file
/// * `cache` - Graph cache to update
///
/// # Returns
///
/// * `Ok(GraphDelta)` - Changes to apply to the graph
/// * `Err(String)` - Error message if file name extraction fails
pub fn handle_file_deleted(path: &Path, cache: &mut GraphCache) -> Result<GraphDelta, String> {
    let file_name = path
        .file_stem()
        .and_then(|s| s.to_str())
        .ok_or_else(|| format!("Invalid file name: {:?}", path))?
        .to_string();

    let mut delta = GraphDelta::default();

    // Remove all outgoing edges from this file
    for link in cache.get_links(&file_name) {
        delta.edges_removed.push(Edge {
            from: file_name.clone(),
            to: link.clone(),
        });

        // Check if phantom node should be removed
        // (this file was the only one linking to it)
        if cache.is_phantom(&link) {
            let remaining_links = cache.count_incoming_links(&link);
            if remaining_links <= 1 {
                delta.nodes_removed.push(link.clone());
                cache.remove_phantom(&link);
            }
        }
    }

    // Check if other files link to this file
    let incoming_links = cache.count_incoming_links(&file_name);

    if incoming_links > 0 {
        // Other files link to this one - convert to phantom node
        delta.nodes_removed.push(file_name.clone());
        delta.nodes_added.push(Node::phantom(&file_name));
        cache.add_phantom(&file_name);
    } else {
        // No links to this file - just remove it
        delta.nodes_removed.push(file_name.clone());
    }

    // Update cache
    cache.remove_file(&file_name);

    Ok(delta)
}
