/**
 * Domain types for the graph visualization.
 * These types represent the core data model of the application.
 */

export type NodeGroup = 'phantom';

export interface Node {
  /** Unique identifier (typically the file name without extension) */
  id: string;

  /** Display name shown in the visualization */
  label: string;

  /** Node size metric based on number of incoming links */
  value: number;

  /** Group for visual styling (null for regular nodes, 'phantom' for broken links) */
  group: NodeGroup | null;

  /** Full path to the markdown file (empty for phantom nodes) */
  file_path: string;

  /** Hashtags extracted from the file content */
  hashtags: string[];
}

export interface Edge {
  /** Source node ID (the file containing the link) */
  from: string;

  /** Target node ID (the link destination) */
  to: string;
}

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

export interface ConnectionResult {
  incoming: Set<string>;
  outgoing: Set<string>;
}
