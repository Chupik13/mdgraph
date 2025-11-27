/*
 * Core domain types for the mdgraph2 application.
 *
 * This module defines the fundamental data structures used throughout the application,
 * representing graph nodes, edges, application configuration, and UI state. These types
 * mirror the Rust backend data structures and provide type safety for the frontend.
 *
 * @module shared/types/domain
 */

/**
 * Represents a node in the knowledge graph visualization.
 *
 * A node can represent either an actual markdown file or a "phantom" node for
 * a referenced but non-existent file. Nodes contain metadata for visualization
 * including positioning, sizing, and grouping information.
 *
 * @property id - Unique identifier (typically the file name without extension)
 * @property label - Display name shown in the visualization
 * @property value - Node size metric based on number of incoming links (backlinks)
 * @property group - Optional grouping identifier (e.g., "phantom" for broken links)
 * @property file_path - Full file system path (empty string for phantom nodes)
 * @property hashtags - List of hashtags found in the file content
 * @property x - Optional X coordinate for node positioning (set by vis-network)
 * @property y - Optional Y coordinate for node positioning (set by vis-network)
 */
export interface Node {
  id: string;
  label: string;
  value: number;
  group: NodeGroup | null;
  file_path: string;
  hashtags: string[];
  x?: number;
  y?: number;
}

/**
 * Node group classifications for visual distinction.
 *
 * Currently only supports "phantom" nodes, which represent broken wiki-links
 * to non-existent files. These are typically rendered with different colors
 * or styles to indicate missing notes.
 */
export type NodeGroup = 'phantom';

/**
 * Represents a directed edge between two nodes in the graph.
 *
 * Edges are created from wiki-link references, pointing from the file containing
 * the link to the target file. All edges are directed (one-way).
 *
 * @property from - Source node ID (the file containing the wiki-link)
 * @property to - Target node ID (the file being referenced)
 */
export interface Edge {
  from: string;
  to: string;
}

/**
 * Complete graph data structure for visualization.
 *
 * Contains all nodes and edges that make up the knowledge graph. This structure
 * is received from the backend and passed to vis-network for rendering.
 *
 * @property nodes - Array of all nodes (files and phantoms) in the graph
 * @property edges - Array of all directed connections between nodes
 */
export interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

/**
 * Previewer-specific configuration.
 *
 * Contains settings related to the markdown preview feature.
 *
 * @property offset - Number of lines to skip from the beginning of the file when displaying preview.
 *                    Useful for skipping frontmatter or headers. Default is 0.
 */
export interface PreviewerConfig {
  offset: number;
}

/**
 * Application configuration structure.
 *
 * Contains configurable parameters loaded from the backend. This structure mirrors
 * the Rust `AppConfig` structure and is received via the `get_config` Tauri command.
 *
 * @property root_dir - Path to the root directory containing markdown files to scan,
 *                      or null if not configured
 * @property previewer - Configuration for the markdown preview feature
 */
export interface AppConfig {
  root_dir: string | null;
  previewer: PreviewerConfig;
}

/**
 * Viewport state for the graph canvas.
 *
 * Tracks the current zoom level and center position of the graph visualization.
 * Used for saving and restoring viewport state, and for camera animations.
 *
 * @property scale - Zoom level (1.0 is normal, > 1.0 is zoomed in, < 1.0 is zoomed out)
 * @property center - Center point of the viewport in graph coordinates
 * @property center.x - X coordinate of the viewport center
 * @property center.y - Y coordinate of the viewport center
 */
export interface ViewportState {
  scale: number;
  center: { x: number; y: number };
}

/**
 * Delta event types for incremental graph updates.
 *
 * These events are emitted by the backend file watcher when files are
 * created, modified, or deleted in the root directory.
 */
export type GraphDeltaEvent =
  | { type: 'node-added'; node: Node }
  | { type: 'node-removed'; node_id: string }
  | { type: 'node-updated'; node: Node }
  | { type: 'edge-added'; edge: Edge }
  | { type: 'edge-removed'; edge: Edge };
