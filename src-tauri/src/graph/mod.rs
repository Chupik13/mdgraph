//! Graph construction module for markdown knowledge networks.
//!
//! This module transforms parsed markdown files into a graph data structure suitable
//! for visualization. It creates nodes for both existing files and "phantom" nodes
//! for broken wiki-links, and establishes edges based on wiki-link references.
//!
//! # Graph Structure
//!
//! - **Nodes**: Represent markdown files and referenced notes (even if they don't exist)
//! - **Edges**: Represent directed wiki-link connections from one note to another
//! - **Phantom Nodes**: Special nodes marked with group="phantom" for broken links
//!
//! # Node Sizing
//!
//! Node size (`value` field) is determined by the number of incoming links (backlinks).
//! Notes that are referenced more frequently appear larger in the visualization.
//!
//! # Performance
//!
//! Time complexity: O(n * m) where n is the number of files and m is the average
//! number of wiki-links per file. Space complexity: O(n + e) where e is the total
//! number of edges.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use crate::scanner::{scan_directory, MarkdownFile};
use crate::parser;

/// Represents a node in the knowledge graph.
///
/// A node can represent either an actual markdown file or a "phantom" node for
/// a referenced but non-existent file. Nodes contain metadata for visualization
/// including size (based on incoming links) and grouping information.
///
/// # Fields
///
/// * `id` - Unique identifier (typically the file name without extension)
/// * `label` - Display name shown in the visualization
/// * `value` - Node size metric based on number of incoming links (backlinks)
/// * `group` - Optional grouping identifier (e.g., "phantom" for broken links)
/// * `file_path` - Full file system path (empty for phantom nodes)
/// * `hashtags` - List of hashtags found in the file content
///
/// # Serialization
///
/// This structure is serialized to JSON and sent to the frontend for vis-network
/// rendering. All fields are included in the JSON output.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Node {
    pub id: String,
    pub label: String,
    pub value: usize,
    pub group: Option<String>,
    pub file_path: String,
    pub hashtags: Vec<String>,
}

/// Represents a directed edge between two nodes in the graph.
///
/// Edges are created from wiki-link references, pointing from the file containing
/// the link to the target file. All edges are directed (one-way).
///
/// # Fields
///
/// * `from` - Source node ID (the file containing the wiki-link)
/// * `to` - Target node ID (the file being referenced)
///
/// # Serialization
///
/// Serialized to JSON for vis-network rendering. Vis-network uses these edges
/// to draw connections between nodes.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Edge {
    pub from: String,
    pub to: String,
}

/// Complete graph data structure for visualization.
///
/// Contains all nodes and edges that make up the knowledge graph. This structure
/// is sent to the frontend as a single JSON object for rendering.
///
/// # Fields
///
/// * `nodes` - Vector of all nodes (files and phantoms) in the graph
/// * `edges` - Vector of all directed connections between nodes
///
/// # JSON Format
///
/// The serialized format matches vis-network's expected data structure:
/// ```json
/// {
///   "nodes": [{"id": "note1", "label": "note1", "value": 5, ...}],
///   "edges": [{"from": "note1", "to": "note2"}]
/// }
/// ```
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GraphData {
    pub nodes: Vec<Node>,
    pub edges: Vec<Edge>,
}

impl GraphData {
    /// Creates an empty graph data structure.
    ///
    /// Initializes a new `GraphData` with empty node and edge vectors.
    /// Typically used at the start of graph construction.
    ///
    /// # Returns
    ///
    /// A new `GraphData` instance with no nodes or edges.
    pub fn new() -> Self {
        Self {
            nodes: Vec::new(),
            edges: Vec::new(),
        }
    }
}

/// Constructs a graph from a collection of markdown files.
///
/// This is the core graph construction algorithm. It processes markdown files in
/// three phases:
/// 1. **Edge Creation**: Parse all files and create edges for wiki-links
/// 2. **File Nodes**: Create nodes for all existing files with backlink counts
/// 3. **Phantom Nodes**: Create nodes for referenced but non-existent files
///
/// # Arguments
///
/// * `files` - Vector of parsed markdown files with their content
///
/// # Returns
///
/// A complete `GraphData` structure with all nodes and edges populated.
///
/// # Algorithm Details
///
/// ## Phase 1: Edge Creation and Link Counting
/// - Iterates through all files and their wiki-links
/// - Creates edges regardless of whether target files exist
/// - Maintains a `link_counts` HashMap to track incoming links per node
/// - Tracks which nodes are referenced and whether they exist
///
/// ## Phase 2: File Node Creation
/// - Creates nodes for all existing markdown files
/// - Sets `value` field based on incoming link count (for node sizing)
/// - Extracts hashtags from file content for categorization
/// - Marks nodes as existing in the tracking HashMap
///
/// ## Phase 3: Phantom Node Creation
/// - Identifies referenced nodes that don't have corresponding files
/// - Creates phantom nodes with `group: "phantom"` for visual distinction
/// - Phantom nodes have empty `file_path` and no hashtags
/// - Still includes backlink count for sizing
///
/// # Performance
///
/// Time complexity: O(n * m) where n is the number of files and m is the average
/// number of wiki-links per file. The algorithm makes multiple passes over the
/// data but each is linear in the input size.
///
/// # Node Naming
///
/// Node IDs use the file name stem (without extension). This means:
/// - `note.md` becomes node ID "note"
/// - Wiki-link `[[note]]` targets node ID "note"
/// - Files with the same name in different directories will collide
pub fn build_graph(files: Vec<MarkdownFile>) -> GraphData {
    let mut graph = GraphData::new();
    let mut link_counts: HashMap<String, usize> = HashMap::new();
    let mut all_referenced_nodes: HashMap<String, bool> = HashMap::new();

    let file_map: HashMap<String, &MarkdownFile> = files
        .iter()
        .map(|f| (f.name.clone(), f))
        .collect();

    for file in &files {
        let parsed = parser::parse_markdown(&file.content);

        for link in &parsed.wiki_links {
            graph.edges.push(Edge {
                from: file.name.clone(),
                to: link.clone(),
            });

            *link_counts.entry(link.clone()).or_insert(0) += 1;

            all_referenced_nodes.insert(link.clone(), file_map.contains_key(link));
        }
    }

    for file in &files {
        let parsed = parser::parse_markdown(&file.content);
        let incoming_links = *link_counts.get(&file.name).unwrap_or(&0);

        graph.nodes.push(Node {
            id: file.name.clone(),
            label: file.name.clone(),
            value: incoming_links,
            group: None,
            file_path: file.path.to_string_lossy().to_string(),
            hashtags: parsed.hashtags,
        });

        all_referenced_nodes.insert(file.name.clone(), true);
    }

    for (node_name, file_exists) in all_referenced_nodes.iter() {
        if !file_exists {
            let incoming_links = *link_counts.get(node_name).unwrap_or(&0);

            graph.nodes.push(Node {
                id: node_name.clone(),
                label: format!("{}", node_name),
                value: incoming_links,
                group: Some("phantom".to_string()),
                file_path: String::new(),
                hashtags: Vec::new(),
            });
        }
    }

    graph
}

/// Scans a directory and builds a graph in a single operation.
///
/// This convenience function combines directory scanning and graph construction,
/// providing a simple one-call interface for the most common use case.
///
/// # Arguments
///
/// * `path` - Path to the directory containing markdown files
///
/// # Returns
///
/// * `Ok(GraphData)` - Successfully constructed graph with all nodes and edges
/// * `Err(String)` - Error message if directory scanning fails
///
/// # Errors
///
/// Returns an error if:
/// - The specified path doesn't exist or isn't a directory
/// - File system permissions prevent reading directories or files
/// - Markdown files contain invalid UTF-8 encoding
///
/// # Examples
///
/// ```ignore
/// // Scan a notes directory and get the complete graph
/// let graph = scan_and_build_graph("/home/user/notes")?;
/// println!("Graph has {} nodes and {} edges",
///          graph.nodes.len(), graph.edges.len());
/// ```
///
/// # Performance
///
/// Performance is dominated by file I/O and scales linearly with the number and
/// size of markdown files in the directory tree.
pub fn scan_and_build_graph(path: &str) -> Result<GraphData, String> {
    let files = scan_directory(path)?;
    let graph = build_graph(files);
    Ok(graph)
}
