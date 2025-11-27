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
import type { Node, Edge, GraphData } from '../../../shared/types';

type ChangeCallback = () => void;
type StatusCallback = () => void;

/**
 * Immutable snapshot of graph service status for useSyncExternalStore.
 *
 * This object is cached and only replaced when values actually change,
 * ensuring reference equality checks work correctly with React's
 * useSyncExternalStore hook.
 */
export interface GraphStatusSnapshot {
  status: GraphStatus;
  error: string | null;
  initialData: GraphData | null;
}

/**
 * Status of the graph data service.
 *
 * - `idle` - Initial state, no data loaded
 * - `loading` - Data is being fetched from backend
 * - `ready` - vis-network is initialized and ready
 * - `error` - Error occurred during loading
 */
export type GraphStatus = 'idle' | 'loading' | 'ready' | 'error';

/**
 * Singleton service for managing graph data and application status.
 *
 * @remarks
 * ## Responsibilities
 * - Ownership of DataSet (nodes and edges)
 * - Providing methods for data access
 * - Applying delta updates from file watcher
 * - Managing application status (idle/loading/ready/error)
 * - Storing initial graph data for Network initialization
 * - Notifying subscribers about data and status changes
 *
 * ## Status Flow
 * ```
 * idle -> loading -> ready (success)
 *                 -> error (failure)
 * ```
 *
 * ## Usage Pattern
 * ```typescript
 * // Set loading status and initial data (in App.tsx)
 * graphDataService.setStatus('loading');
 * graphDataService.setInitialData(graphData);
 *
 * // React subscription (via useGraphStatus hook)
 * const { status, error, initialData } = useGraphStatus();
 *
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
  private statusCallbacks = new Set<StatusCallback>();
  private phantomNodeIds = new Set<string>();

  private _status: GraphStatus = 'idle';
  private _error: string | null = null;
  private _initialGraphData: GraphData | null = null;

  /** Cached snapshot for useSyncExternalStore (reference equality) */
  private _statusSnapshot: GraphStatusSnapshot = {
    status: 'idle',
    error: null,
    initialData: null,
  };

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

    this._status = 'ready';
    this.notifyChange();
    this.notifyStatusChange();
  }

  /**
   * Checks if the service is initialized and ready.
   *
   * @returns true if service is ready for use
   */
  isReady(): boolean {
    return this._status === 'ready';
  }

  /**
   * Gets the current status of the graph service.
   *
   * @returns Current status
   */
  getStatus(): GraphStatus {
    return this._status;
  }

  /**
   * Gets the current error message if status is 'error'.
   *
   * @returns Error message or null
   */
  getError(): string | null {
    return this._error;
  }

  /**
   * Sets the status of the graph service.
   *
   * @param status - New status
   * @param error - Error message (only used when status is 'error')
   */
  setStatus(status: GraphStatus, error?: string): void {
    this._status = status;
    this._error = status === 'error' ? (error ?? 'Unknown error') : null;
    this.notifyStatusChange();
  }

  /**
   * Stores initial graph data before Network initialization.
   *
   * This data is used by useGraphNetwork to create the vis-network instance.
   * After initialization, use getNodes()/getEdges() to access current data.
   * Also initializes phantomNodeIds set from the initial data.
   *
   * @param data - Graph data from backend
   */
  setInitialData(data: GraphData): void {
    this._initialGraphData = data;

    // Initialize phantom node tracking from initial data
    this.phantomNodeIds.clear();
    data.nodes.forEach(node => {
      if (node.group === 'phantom') {
        this.phantomNodeIds.add(node.id);
      }
    });

    this.notifyStatusChange();
  }

  /**
   * Gets the initial graph data for Network creation.
   *
   * @returns Initial graph data or null if not set
   */
  getInitialData(): GraphData | null {
    return this._initialGraphData;
  }

  /**
   * Gets the cached status snapshot for useSyncExternalStore.
   *
   * Returns the same object reference until status actually changes,
   * preventing infinite render loops in React's useSyncExternalStore.
   *
   * @returns Cached status snapshot
   */
  getStatusSnapshot(): GraphStatusSnapshot {
    return this._statusSnapshot;
  }

  /**
   * Subscribes to status changes.
   *
   * @param callback - Function called on status change
   * @returns Unsubscribe function
   */
  subscribeToStatus(callback: StatusCallback): () => void {
    this.statusCallbacks.add(callback);
    return () => this.statusCallbacks.delete(callback);
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
   * If a node with the same ID already exists, it will be updated instead.
   * The `group` property is removed before adding to vis-network DataSet
   * because vis-network requires groups to be defined in options, but we
   * handle styling directly via color properties. Phantom status is tracked
   * separately in phantomNodeIds set.
   *
   * @param node - Node to add (with styles already applied)
   */
  addNode(node: Node): void {
    if (!this.nodesDataSet) return;

    // Track phantom nodes separately (group is removed from DataSet)
    if (node.group === 'phantom') {
      this.phantomNodeIds.add(node.id);
    } else {
      this.phantomNodeIds.delete(node.id);
    }

    // Remove 'group' to avoid vis-network "updateGroupOptions" error
    // (we apply styles directly, not via vis-network groups)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { group, ...nodeWithoutGroup } = node;

    if (this.nodesDataSet.get(node.id)) {
      this.nodesDataSet.update(nodeWithoutGroup as Node);
    } else {
      this.nodesDataSet.add(nodeWithoutGroup as Node);
    }
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
    this.phantomNodeIds.delete(nodeId);
    this.notifyChange();
  }

  /**
   * Checks if a node is a phantom node (broken wiki-link).
   *
   * @param nodeId - ID of the node to check
   * @returns true if the node is a phantom node
   */
  isPhantom(nodeId: string): boolean {
    return this.phantomNodeIds.has(nodeId);
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
   * Resets the service for component unmount.
   *
   * Resets network, DataSet, and status to initial state.
   * Preserves the following for React StrictMode remount support:
   * - _initialGraphData: Allows re-initialization without re-fetching
   * - phantomNodeIds: Maintains phantom node tracking across remounts
   * - changeCallbacks/statusCallbacks: Subscriptions are managed by React cleanup
   *
   * @remarks
   * This method is called during component unmount. React's `useSyncExternalStore`
   * and effect cleanup functions handle subscription removal automatically.
   * Clearing callbacks here would cause duplicate listeners on StrictMode remount.
   */
  destroy(): void {
    this.nodesDataSet = null;
    this.edgesDataSet = null;
    this.network = null;
    // Don't clear callbacks - React cleanup handles subscription removal
    // Don't clear phantomNodeIds or _initialGraphData - needed for StrictMode remount
    this._status = 'idle';
    this._error = null;
    this.notifyStatusChange();
  }

  /**
   * Notifies all subscribers about a data change.
   */
  private notifyChange(): void {
    this.changeCallbacks.forEach(cb => cb());
  }

  /**
   * Notifies all subscribers about a status change.
   *
   * Rebuilds the cached snapshot before notifying, ensuring
   * useSyncExternalStore gets a new reference only when values change.
   */
  private notifyStatusChange(): void {
    this._statusSnapshot = {
      status: this._status,
      error: this._error,
      initialData: this._initialGraphData,
    };
    this.statusCallbacks.forEach(cb => cb());
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
