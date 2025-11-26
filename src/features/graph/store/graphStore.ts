/**
 * Graph data state management store.
 *
 * This module provides the central Zustand store for managing graph data, visualization
 * state, filters, and the vis-network instance. It serves as the single source of truth
 * for all graph-related state in the application.
 *
 * @module features/graph/store/graphStore
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer';
import type { Network } from 'vis-network';
import type { DataSet } from 'vis-data';
import type { GraphData, Node, Edge, GraphFilters } from '../../../shared/types';

enableMapSet();

/**
 * Graph store state interface.
 *
 * Defines the complete state shape for the graph feature, including data,
 * loading states, the vis-network instance, filters, and all available actions.
 */
interface GraphState {
  /**
   * Complete graph data received from the backend.
   * Null when no data has been loaded yet.
   */
  graphData: GraphData | null;

  /**
   * Loading state indicator.
   * True while fetching graph data from the backend.
   */
  isLoading: boolean;

  /**
   * Error message if graph loading or operations fail.
   * Null when no error has occurred.
   */
  error: string | null;

  /**
   * Reference to the vis-network visualization instance.
   * Used for imperative operations like focusing nodes or camera control.
   * Null until the network is initialized.
   */
  networkInstance: Network | null;

  /**
   * Active filters for controlling graph visualization.
   * Determines which nodes and edges are visible.
   */
  filters: GraphFilters;

  /**
   * Updates the graph data and resets loading/error states.
   *
   * Typically called when receiving new data from the backend via Tauri events
   * or after a manual scan operation.
   *
   * @param data - Complete graph data with nodes and edges
   */
  setGraphData: (data: GraphData) => void;

  /**
   * Sets the loading state.
   *
   * Should be set to true before initiating a graph scan and will be
   * automatically reset to false when data arrives or an error occurs.
   *
   * @param loading - Loading state boolean
   */
  setLoading: (loading: boolean) => void;

  /**
   * Sets an error message and resets loading state.
   *
   * @param error - Error message string, or null to clear the error
   */
  setError: (error: string | null) => void;

  /**
   * Stores a reference to the vis-network instance.
   *
   * This reference enables imperative operations on the visualization such as
   * focusing specific nodes, animating the camera, or retrieving node positions.
   *
   * @param network - vis-network instance, or null to clear
   */
  setNetworkInstance: (network: Network | null) => void;

  /**
   * Partially updates the filter configuration.
   *
   * Merges the provided partial filters with existing filter state, allowing
   * selective updates without replacing the entire filter object.
   *
   * @param filters - Partial filter object with fields to update
   */
  updateFilters: (filters: Partial<GraphFilters>) => void;

  /**
   * Updates only the search query filter.
   *
   * Convenience method for updating just the search query without affecting
   * other filter settings.
   *
   * @param query - Search query string (empty string shows all nodes)
   */
  setSearchFilter: (query: string) => void;

  /**
   * Resets the graph to its initial empty state.
   *
   * Clears graph data, network instance, and error state. Useful when
   * changing to a different notes directory or reinitializing the application.
   */
  resetGraph: () => void;

  /**
   * Retrieves all nodes connected to a given node.
   *
   * Searches both outgoing and incoming edges to find all directly connected
   * nodes. Useful for highlighting neighborhoods or implementing navigation.
   *
   * @param nodeId - ID of the node to find connections for
   * @returns Array of connected node IDs (empty if node not found or no connections)
   */
  getConnectedNodes: (nodeId: string) => string[];

  /**
   * Retrieves a specific node by ID.
   *
   * @param nodeId - ID of the node to retrieve
   * @returns Node object if found, undefined otherwise
   */
  getNode: (nodeId: string) => Node | undefined;

  /**
   * Adds a new node to the graph data.
   *
   * Used for incremental updates from the file watcher.
   *
   * @param node - Node to add
   */
  addNode: (node: Node) => void;

  /**
   * Removes a node and its connected edges from the graph data.
   *
   * @param nodeId - ID of the node to remove
   */
  removeNode: (nodeId: string) => void;

  /**
   * Updates an existing node in the graph data.
   *
   * @param node - Node with updated properties
   */
  updateNode: (node: Node) => void;

  /**
   * Adds a new edge to the graph data.
   *
   * @param edge - Edge to add
   */
  addEdge: (edge: Edge) => void;

  /**
   * Removes an edge from the graph data.
   *
   * @param edge - Edge to remove (matched by from/to)
   */
  removeEdge: (edge: Edge) => void;

  /**
   * Gets nodes from vis-network DataSet (runtime state).
   *
   * This is the source of truth for current graph nodes after delta updates.
   * Use this instead of graphData.nodes for navigation and other runtime operations.
   *
   * @returns Array of nodes from DataSet, or empty array if network not initialized
   */
  getNodesFromDataSet: () => Node[];

  /**
   * Gets edges from vis-network DataSet (runtime state).
   *
   * This is the source of truth for current graph edges after delta updates.
   *
   * @returns Array of edges from DataSet, or empty array if network not initialized
   */
  getEdgesFromDataSet: () => Edge[];
}

/**
 * Zustand store for graph state management.
 *
 * This store combines multiple middlewares for enhanced functionality:
 * - **immer**: Enables mutable-style state updates with immutable guarantees
 * - **subscribeWithSelector**: Allows selective subscriptions to specific state slices
 * - **devtools**: Integrates with Redux DevTools for debugging
 *
 * @remarks
 * - MapSet support is enabled via Immer for efficient Set/Map state management
 * - Initial state has no graph data loaded (null)
 * - Filters are initialized with default values showing all nodes
 *
 * @example
 * // Subscribe to just the graph data
 * const graphData = useGraphStore((state) => state.graphData);
 *
 * @example
 * // Update graph data
 * const setGraphData = useGraphStore((state) => state.setGraphData);
 * setGraphData(newGraphData);
 *
 * @example
 * // Get connected nodes
 * const connected = useGraphStore.getState().getConnectedNodes('note1');
 *
 * @example
 * // Update search filter
 * const setSearchFilter = useGraphStore((state) => state.setSearchFilter);
 * setSearchFilter('my search query');
 */
export const useGraphStore = create<GraphState>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        graphData: null,
        isLoading: false,
        error: null,
        networkInstance: null,
        filters: {
          showPhantomNodes: true,
          hashtags: [],
          searchQuery: '',
          nodeGroups: [],
        },

        setGraphData: data =>
          set(state => {
            state.graphData = data;
            state.isLoading = false;
            state.error = null;
          }),

        setLoading: loading =>
          set(state => {
            state.isLoading = loading;
          }),

        setError: error =>
          set(state => {
            state.error = error;
            state.isLoading = false;
          }),

        setNetworkInstance: network =>
          set(state => {
            state.networkInstance = network;
          }),

        updateFilters: filters =>
          set(state => {
            state.filters = { ...state.filters, ...filters };
          }),

        setSearchFilter: query =>
          set(state => {
            state.filters.searchQuery = query;
          }),

        resetGraph: () =>
          set(state => {
            state.graphData = null;
            state.networkInstance = null;
            state.error = null;
          }),

        getConnectedNodes: (nodeId: string): string[] => {
          const { graphData } = get();
          if (!graphData) return [];

          const connected = new Set<string>();
          graphData.edges.forEach(edge => {
            if (edge.from === nodeId) connected.add(edge.to);
            if (edge.to === nodeId) connected.add(edge.from);
          });

          return Array.from(connected);
        },

        getNode: (nodeId: string): Node | undefined => {
          const { graphData } = get();
          return graphData?.nodes.find(n => n.id === nodeId);
        },

        addNode: node =>
          set(state => {
            if (state.graphData) {
              state.graphData.nodes.push(node);
            }
          }),

        removeNode: nodeId =>
          set(state => {
            if (!state.graphData) return;
            state.graphData.nodes = state.graphData.nodes.filter(n => n.id !== nodeId);
            // Also remove edges connected to this node
            state.graphData.edges = state.graphData.edges.filter(
              e => e.from !== nodeId && e.to !== nodeId
            );
          }),

        updateNode: node =>
          set(state => {
            if (!state.graphData) return;
            const idx = state.graphData.nodes.findIndex(n => n.id === node.id);
            if (idx !== -1) {
              state.graphData.nodes[idx] = node;
            }
          }),

        addEdge: edge =>
          set(state => {
            if (state.graphData) {
              state.graphData.edges.push(edge);
            }
          }),

        removeEdge: edge =>
          set(state => {
            if (!state.graphData) return;
            state.graphData.edges = state.graphData.edges.filter(
              e => !(e.from === edge.from && e.to === edge.to)
            );
          }),

        getNodesFromDataSet: (): Node[] => {
          const { networkInstance } = get();
          if (!networkInstance) return [];
          // @ts-expect-error - accessing internal vis-network structure
          const nodesDataSet = networkInstance.body.data.nodes as DataSet<Node>;
          return nodesDataSet.get();
        },

        getEdgesFromDataSet: (): Edge[] => {
          const { networkInstance } = get();
          if (!networkInstance) return [];
          // @ts-expect-error - accessing internal vis-network structure
          const edgesDataSet = networkInstance.body.data.edges as DataSet<Edge>;
          return edgesDataSet.get();
        },
      }))
    ),
    { name: 'GraphStore' }
  )
);
