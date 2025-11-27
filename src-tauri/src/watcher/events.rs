//! Tauri event types and emission for graph delta updates.
//!
//! Defines the event types sent to the frontend and provides functions for
//! emitting delta events through Tauri's event system.

use serde::Serialize;
use tauri::{AppHandle, Emitter};

use crate::graph::{Edge, Node};
use super::delta::GraphDelta;

/// Event types for incremental graph updates.
///
/// Each variant represents a specific change to the graph structure. The frontend
/// handles these events to update the vis-network visualization incrementally.
#[derive(Debug, Clone, Serialize)]
#[serde(tag = "type", rename_all = "kebab-case")]
pub enum GraphDeltaEvent {
    /// A new node was added to the graph
    NodeAdded { node: Node },

    /// A node was removed from the graph
    NodeRemoved { node_id: String },

    /// A node was updated (e.g., hashtags changed)
    NodeUpdated { node: Node },

    /// A new edge was added between two nodes
    EdgeAdded { edge: Edge },

    /// An edge was removed from the graph
    EdgeRemoved { edge: Edge },
}

/// Emits all delta events to the frontend.
///
/// Iterates through the delta and emits individual events for each change.
/// This allows the frontend to process changes incrementally.
///
/// # Arguments
///
/// * `app` - Tauri application handle
/// * `delta` - Graph delta containing all changes to emit
pub fn emit_delta(app: &AppHandle, delta: GraphDelta) {
    // IMPORTANT: Order matters! Removals must come before additions
    // to handle phantom->real node transitions correctly.

    // Emit node removals first (e.g., remove phantom before adding real node)
    for node_id in delta.nodes_removed {
        if let Err(e) = app.emit("graph-delta", GraphDeltaEvent::NodeRemoved { node_id }) {
            eprintln!("[Watcher] Failed to emit node-removed event: {}", e);
        }
    }

    // Emit edge removals
    for edge in delta.edges_removed {
        if let Err(e) = app.emit("graph-delta", GraphDeltaEvent::EdgeRemoved { edge }) {
            eprintln!("[Watcher] Failed to emit edge-removed event: {}", e);
        }
    }

    // Emit node additions
    for node in delta.nodes_added {
        if let Err(e) = app.emit("graph-delta", GraphDeltaEvent::NodeAdded { node }) {
            eprintln!("[Watcher] Failed to emit node-added event: {}", e);
        }
    }

    // Emit node updates
    for node in delta.nodes_updated {
        if let Err(e) = app.emit("graph-delta", GraphDeltaEvent::NodeUpdated { node }) {
            eprintln!("[Watcher] Failed to emit node-updated event: {}", e);
        }
    }

    // Emit edge additions
    for edge in delta.edges_added {
        if let Err(e) = app.emit("graph-delta", GraphDeltaEvent::EdgeAdded { edge }) {
            eprintln!("[Watcher] Failed to emit edge-added event: {}", e);
        }
    }
}
