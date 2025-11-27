/**
 * Node coloring and selection state management.
 *
 * This module provides a Zustand store for managing node visual states including
 * selection, focus, highlighting, and connection tracking. It handles the visual
 * distinction between selected, focused, incoming, and outgoing nodes.
 *
 * @module features/coloring/store/coloringStore
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer';
import { graphDataService } from '../../graph/services/GraphDataService';

enableMapSet();

/**
 * Node coloring and selection state interface.
 *
 * Manages multiple levels of node visual states:
 * - **Selection**: The primary selected node (typically clicked or chosen)
 * - **Focus**: The node currently under camera focus (may differ from selection)
 * - **Connections**: Incoming and outgoing nodes from the selected node
 * - **Highlighting**: General highlighting for hover or temporary emphasis
 * - **Active Nodes**: Filtered set of visible nodes (used during search)
 */
interface ColoringState {
  /**
   * Currently selected node ID.
   * The selected node is shown with distinct coloring and its connections are highlighted.
   */
  selectedNodeId: string | null;

  /**
   * Currently focused node ID (camera target).
   * The focused node may differ from the selected node during navigation.
   */
  focusedNodeId: string | null;

  /**
   * Set of all highlighted node IDs.
   * Includes the selected node plus all its incoming and outgoing connections.
   */
  highlightedNodes: Set<string>;

  /**
   * Set of node IDs with incoming edges to the selected node.
   * These nodes link TO the selected node.
   */
  incomingNodeIds: Set<string>;

  /**
   * Set of node IDs with outgoing edges from the selected node.
   * These are nodes that the selected node links to.
   */
  outgoingNodeIds: Set<string>;

  /**
   * Set of active (visible) node IDs during filtering/search.
   * Null means all nodes are active (no filtering).
   */
  activeNodeIds: Set<string> | null;

  /**
   * Selects a node and calculates its connections.
   *
   * When a node is selected:
   * 1. The selected node ID is stored
   * 2. All incoming and outgoing edges are calculated from GraphDataService
   * 3. The highlighted nodes set is updated
   * 4. The vis-network instance is updated to show visual selection
   *
   * @param nodeId - Node ID to select, or null to deselect
   *
   * @remarks
   * Selecting null clears all connection tracking and visual highlighting.
   * The vis-network selection state is synchronized with this store.
   * Edge data is retrieved from GraphDataService (single source of truth).
   */
  selectNode: (nodeId: string | null) => void;

  /**
   * Sets the focused node (camera target) without full selection.
   *
   * Focusing a node moves the camera to it but doesn't highlight connections
   * or change the selection state. This is used during navigation to preview
   * nodes before selecting them.
   *
   * @param nodeId - Node ID to focus, or null to clear focus
   */
  focusNode: (nodeId: string | null) => void;

  /**
   * Highlights a node and all its direct connections.
   *
   * This is a lighter-weight operation than full selection, typically used
   * for hover effects or temporary emphasis.
   *
   * @param nodeId - Node ID to highlight
   *
   * @remarks
   * Unlike `selectNode`, this doesn't update the selected state or
   * incoming/outgoing tracking.
   * Edge data is retrieved from GraphDataService (single source of truth).
   */
  highlightConnectedNodes: (nodeId: string) => void;

  /**
   * Clears all highlighting without affecting selection.
   */
  clearHighlight: () => void;

  /**
   * Sets the active nodes for search/filter operations.
   *
   * When searching or filtering, this restricts which nodes are considered
   * "active" for navigation and visual emphasis. Inactive nodes are typically
   * rendered with reduced opacity.
   *
   * @param nodeIds - Array of active node IDs, or null to make all nodes active
   *
   * @remarks
   * Setting to null removes all filtering and makes the entire graph active.
   * This is called when exiting search mode.
   */
  setActiveNodes: (nodeIds: string[] | null) => void;

  /**
   * Clears all selection, focus, and highlighting state.
   *
   * Resets the store to its initial empty state, removing all visual emphasis
   * from the graph.
   */
  clearSelection: () => void;
}

/**
 * Zustand store for node coloring and selection management.
 *
 * This store combines multiple middlewares:
 * - **immer**: Enables mutable-style updates for Sets and complex state
 * - **devtools**: Integrates with Redux DevTools for debugging
 *
 * @remarks
 * ## State Management Pattern
 * The store uses Sets for efficient node ID lookups and to avoid duplicates.
 * Immer's enableMapSet() allows mutating Sets directly in the state update
 * functions while maintaining immutability under the hood.
 *
 * ## Connection Tracking
 * When a node is selected, the store calculates and caches its connections:
 * - Scans all edges to find incoming connections (edges TO the node)
 * - Scans all edges to find outgoing connections (edges FROM the node)
 * - Stores results in Sets for O(1) lookup during rendering
 *
 * ## Visual Synchronization
 * The store directly interacts with the vis-network instance to keep
 * visual selection synchronized with state. This is necessary because
 * vis-network maintains its own internal selection state.
 *
 * @example
 * // Select a node
 * const selectNode = useColoringStore((state) => state.selectNode);
 * selectNode('note1');
 *
 * @example
 * // Get current selection and connections
 * const selectedNodeId = useColoringStore((state) => state.selectedNodeId);
 * const incoming = useColoringStore((state) => state.incomingNodeIds);
 * const outgoing = useColoringStore((state) => state.outgoingNodeIds);
 *
 * @example
 * // Focus without selecting
 * const focusNode = useColoringStore((state) => state.focusNode);
 * focusNode('note2'); // Camera moves but no connection highlighting
 */
export const useColoringStore = create<ColoringState>()(
  devtools(
    immer(set => ({
      selectedNodeId: null,
      focusedNodeId: null,
      highlightedNodes: new Set(),
      incomingNodeIds: new Set(),
      outgoingNodeIds: new Set(),
      activeNodeIds: null,

      selectNode: nodeId =>
        set(state => {
          state.selectedNodeId = nodeId;

          if (nodeId) {
            // Use GraphDataService as single source of truth for connections
            const { incoming, outgoing } = graphDataService.getConnectedNodeIds(nodeId);

            state.incomingNodeIds = incoming;
            state.outgoingNodeIds = outgoing;
            state.highlightedNodes = new Set([nodeId, ...incoming, ...outgoing]);

            const networkInstance = graphDataService.getNetwork();
            if (networkInstance) {
              networkInstance.selectNodes([nodeId]);
            }
          } else {
            state.incomingNodeIds.clear();
            state.outgoingNodeIds.clear();
            state.highlightedNodes.clear();

            const networkInstance = graphDataService.getNetwork();
            if (networkInstance) {
              networkInstance.unselectAll();
            }
          }
        }),

      focusNode: nodeId =>
        set(state => {
          state.focusedNodeId = nodeId;
        }),

      highlightConnectedNodes: nodeId =>
        set(state => {
          // Use GraphDataService as single source of truth for connections
          const { incoming, outgoing } = graphDataService.getConnectedNodeIds(nodeId);
          const connected = new Set([...incoming, ...outgoing]);
          state.highlightedNodes = new Set([nodeId, ...connected]);
        }),

      clearHighlight: () =>
        set(state => {
          state.highlightedNodes.clear();
        }),

      setActiveNodes: nodeIds =>
        set(state => {
          if (nodeIds === null) {
            state.activeNodeIds = null;
          } else {
            state.activeNodeIds = new Set(nodeIds);
          }
        }),

      clearSelection: () =>
        set(state => {
          state.selectedNodeId = null;
          state.focusedNodeId = null;
          state.highlightedNodes.clear();
          state.incomingNodeIds.clear();
          state.outgoingNodeIds.clear();
        }),
    })),
    { name: 'ColoringStore' }
  )
);
