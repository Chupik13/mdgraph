/**
 * Central data service for graph management.
 *
 * GraphDataService is the single owner of vis-data DataSet and serves as the
 * single source of truth for all graph data. It encapsulates all vis-network
 * DataSet operations and provides a type-safe API for reading and modifying
 * graph data. After initialization, all data reads must go through this service.
 *
 * @module features/graph/services/GraphDataService
 */

import { DataSet } from 'vis-data';
import type { Network } from 'vis-network';
import type { Node, Edge } from '../../../shared/types';

type ChangeCallback = () => void;

/**
 * Singleton service for managing graph data.
 *
 * @remarks
 * ## Responsibilities
 * - Ownership of DataSet (nodes and edges)
 * - Providing methods for data access
 * - Applying delta updates from file watcher
 * - Reinitialization on full graph reload
 * - Notifying subscribers about changes
 *
 * ## Usage Pattern
 * ```typescript
 * // Initialization (in useGraphNetwork)
 * graphDataService.initialize(network);
 *
 * // Reading (in any hook/component)
 * const nodes = graphDataService.getNodes();
 * const node = graphDataService.getNode('my-node-id');
 *
 * // Mutations (in useGraphDeltaSync)
 * graphDataService.addNode(newNode);
 * graphDataService.removeNode('node-id');
 * ```
 */
class GraphDataService {
  private nodesDataSet: DataSet<Node> | null = null;
  private edgesDataSet: DataSet<Edge & { id: string }> | null = null;
  private network: Network | null = null;
  private changeCallbacks = new Set<ChangeCallback>();
  private isInitialized = false;

  /**
   * Initializes the service with a Network instance.
   *
   * IMPORTANT: After initialization, DataSet becomes the single source of truth.
   * All data reads must go through this service's methods.
   *
   * @param network - vis-network instance for DataSet access
   *
   * @remarks
   * - DataSet is extracted from network.body.data (internal vis-network structure)
   * - Subsequent calls reinitialize the service
   * - All subscribers are notified after initialization
   */
  initialize(network: Network): void {
    this.network = network;

    // Extract DataSet from vis-network internals
    // @ts-expect-error - accessing internal vis-network structure
    this.nodesDataSet = network.body.data.nodes as DataSet<Node>;
    // @ts-expect-error - accessing internal vis-network structure
    this.edgesDataSet = network.body.data.edges as DataSet<Edge & { id: string }>;

    this.isInitialized = true;
    this.notifyChange();
  }

  /**
   * Checks if the service is initialized and ready.
   *
   * @returns true if service is ready for use
   */
  isReady(): boolean {
    return this.isInitialized && this.nodesDataSet !== null && this.edgesDataSet !== null;
  }

  /**
   * Gets all nodes from the DataSet.
   *
   * @returns Array of all nodes, or empty array if not initialized
   */
  getNodes(): Node[] {
    if (!this.nodesDataSet) return [];
    return this.nodesDataSet.get();
  }

  /**
   * Gets all edges from the DataSet.
   *
   * @returns Array of all edges, or empty array if not initialized
   */
  getEdges(): Edge[] {
    if (!this.edgesDataSet) return [];
    return this.edgesDataSet.get().map(e => ({ from: e.from, to: e.to }));
  }

  /**
   * Gets a specific node by ID.
   *
   * @param nodeId - The node ID to look up
   * @returns The node or undefined if not found
   */
  getNode(nodeId: string): Node | undefined {
    if (!this.nodesDataSet) return undefined;
    return this.nodesDataSet.get(nodeId) ?? undefined;
  }

  /**
   * Gets all nodes connected to a given node.
   *
   * Analyzes graph edges and returns two sets:
   * - incoming: nodes with edges pointing TO the given node (A → nodeId)
   * - outgoing: nodes with edges pointing FROM the given node (nodeId → B)
   *
   * @param nodeId - The node ID to find connections for
   * @returns Object with incoming and outgoing node ID sets
   */
  getConnectedNodeIds(nodeId: string): { incoming: Set<string>; outgoing: Set<string> } {
    const incoming = new Set<string>();
    const outgoing = new Set<string>();

    if (!this.edgesDataSet) {
      return { incoming, outgoing };
    }

    const edges = this.edgesDataSet.get();

    edges.forEach(edge => {
      if (edge.from === nodeId) {
        outgoing.add(edge.to);
      }
      if (edge.to === nodeId) {
        incoming.add(edge.from);
      }
    });

    return { incoming, outgoing };
  }

  /**
   * Gets all node IDs.
   *
   * @returns Array of all node IDs
   */
  getNodeIds(): string[] {
    if (!this.nodesDataSet) return [];
    return this.nodesDataSet.getIds() as string[];
  }

  /**
   * Adds a new node to the graph.
   *
   * @param node - Node to add (with styles already applied)
   */
  addNode(node: Node): void {
    if (!this.nodesDataSet) return;
    this.nodesDataSet.add(node);
    this.notifyChange();
  }

  /**
   * Removes a node from the graph.
   *
   * @param nodeId - ID of the node to remove
   */
  removeNode(nodeId: string): void {
    if (!this.nodesDataSet) return;
    this.nodesDataSet.remove(nodeId);
    this.notifyChange();
  }

  /**
   * Updates an existing node.
   *
   * @param node - Node with updated fields (id is required)
   */
  updateNode(node: Partial<Node> & { id: string }): void {
    if (!this.nodesDataSet) return;
    this.nodesDataSet.update(node);
    this.notifyChange();
  }

  /**
   * Updates multiple nodes in a single operation.
   *
   * @param nodes - Array of nodes with updated fields
   */
  updateNodes(nodes: Array<Partial<Node> & { id: string }>): void {
    if (!this.nodesDataSet || nodes.length === 0) return;
    this.nodesDataSet.update(nodes);
    this.notifyChange();
  }

  /**
   * Adds a new edge to the graph.
   *
   * @param edge - Edge to add (deduplication is handled internally)
   */
  addEdge(edge: Edge): void {
    if (!this.edgesDataSet) return;
    const edgeId = `${edge.from}->${edge.to}`;

    // Check if edge already exists
    if (!this.edgesDataSet.get(edgeId)) {
      this.edgesDataSet.add({ id: edgeId, from: edge.from, to: edge.to });
      this.notifyChange();
    }
  }

  /**
   * Removes an edge from the graph.
   *
   * @param edge - Edge to remove (matched by from/to)
   */
  removeEdge(edge: Edge): void {
    if (!this.edgesDataSet) return;
    const edgeId = `${edge.from}->${edge.to}`;
    this.edgesDataSet.remove(edgeId);
    this.notifyChange();
  }

  /**
   * Subscribes to graph data changes.
   *
   * @param callback - Function called on any data change
   * @returns Unsubscribe function
   */
  subscribe(callback: ChangeCallback): () => void {
    this.changeCallbacks.add(callback);
    return () => this.changeCallbacks.delete(callback);
  }

  /**
   * Gets the Network instance for imperative operations.
   *
   * Used for operations not related to data:
   * - Camera control (focus, zoom, moveTo)
   * - Getting node positions
   * - Node selection highlighting
   *
   * @returns Network instance or null if not initialized
   */
  getNetwork(): Network | null {
    return this.network;
  }

  /**
   * Cleans up the service on unmount.
   */
  destroy(): void {
    this.nodesDataSet = null;
    this.edgesDataSet = null;
    this.network = null;
    this.changeCallbacks.clear();
    this.isInitialized = false;
  }

  /**
   * Notifies all subscribers about a data change.
   */
  private notifyChange(): void {
    this.changeCallbacks.forEach(cb => cb());
  }
}

/**
 * Singleton instance of GraphDataService for the entire application.
 *
 * @example
 * ```typescript
 * import { graphDataService } from './services/GraphDataService';
 *
 * // Reading data
 * const nodes = graphDataService.getNodes();
 *
 * // Subscribing to changes
 * const unsubscribe = graphDataService.subscribe(() => {
 *   console.log('Graph data changed');
 * });
 * ```
 */
export const graphDataService = new GraphDataService();
