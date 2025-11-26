/**
 * Tauri event listeners for backend-to-frontend communication.
 *
 * This module provides typed wrappers for subscribing to Tauri events emitted
 * from the Rust backend. Events enable real-time updates from backend processes
 * such as file system watchers or periodic data refreshes.
 *
 * @module infrastructure/tauri/events
 */

import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import type { GraphData, GraphDeltaEvent } from '../../shared/types';

/**
 * Collection of type-safe Tauri event listeners.
 *
 * This object provides methods for subscribing to all available Tauri events,
 * ensuring type safety for event payloads. Use these wrappers instead of calling
 * `listen` directly to get better TypeScript support.
 *
 * @example
 * import { TauriEvents } from '@infrastructure/tauri/events';
 *
 * // Subscribe to graph updates
 * const unlisten = await TauriEvents.onGraphUpdate((graphData) => {
 *   console.log('Graph updated:', graphData);
 * });
 *
 * // Cleanup when component unmounts
 * unlisten();
 */
export const TauriEvents = {
  /**
   * Subscribes to graph update events from the backend.
   *
   * This event is emitted when the backend detects changes to markdown files
   * (typically through a file system watcher). When files are added, modified,
   * or deleted, the backend re-scans and emits a complete updated graph.
   *
   * @param callback - Function called when a graph update event is received.
   *                   Receives the complete updated graph data as its argument.
   * @returns Promise that resolves to an unlisten function. Call this function
   *          to unsubscribe from the event and prevent memory leaks.
   *
   * @remarks
   * - The callback receives the COMPLETE graph data, not a delta/patch
   * - Multiple subscribers can listen to the same event simultaneously
   * - Always call the unlisten function when the component unmounts to prevent
   *   memory leaks and duplicate event handling
   * - The event payload is automatically deserialized from JSON
   *
   * @example
   * // In a React component
   * useEffect(() => {
   *   let unlisten: (() => void) | undefined;
   *
   *   TauriEvents.onGraphUpdate((graphData) => {
   *     console.log(`Received ${graphData.nodes.length} nodes`);
   *     updateGraphVisualization(graphData);
   *   }).then((unlistenFn) => {
   *     unlisten = unlistenFn;
   *   });
   *
   *   return () => {
   *     if (unlisten) unlisten();
   *   };
   * }, []);
   */
  onGraphUpdate(callback: (graphData: GraphData) => void): Promise<UnlistenFn> {
    return listen<GraphData>('graph-update', event => {
      try {
        // Validate basic structure before passing to callback
        if (!event.payload || typeof event.payload !== 'object') {
          console.error('Invalid graph update payload:', event.payload);
          return;
        }

        const graphData = event.payload;

        if (!Array.isArray(graphData.nodes) || !Array.isArray(graphData.edges)) {
          console.error('Graph update payload missing nodes or edges arrays:', graphData);
          return;
        }

        callback(graphData);
      } catch (error) {
        console.error('Error processing graph update event:', error);
      }
    });
  },

  /**
   * Subscribes to incremental graph delta events from the backend.
   *
   * This event is emitted when the backend file watcher detects changes to markdown
   * files. Unlike `onGraphUpdate`, this provides granular updates for individual
   * nodes and edges, enabling incremental visualization updates without full redraws.
   *
   * @param callback - Function called when a delta event is received.
   *                   Receives the specific change (node added/removed, edge added/removed).
   * @returns Promise that resolves to an unlisten function.
   *
   * @remarks
   * - Events are emitted for each individual change (not batched)
   * - Use this for real-time updates to maintain node positions
   * - The vis-network DataSet API should be used for efficient updates
   * - Invalid events are logged but don't crash the application
   *
   * @example
   * TauriEvents.onGraphDelta((event) => {
   *   switch (event.type) {
   *     case 'node-added':
   *       nodesDataSet.add(event.node);
   *       break;
   *     case 'node-removed':
   *       nodesDataSet.remove(event.node_id);
   *       break;
   *     // ... handle other event types
   *   }
   * });
   */
  onGraphDelta(callback: (event: GraphDeltaEvent) => void): Promise<UnlistenFn> {
    return listen<GraphDeltaEvent>('graph-delta', event => {
      try {
        // Validate event structure
        if (!event.payload || typeof event.payload !== 'object' || !('type' in event.payload)) {
          console.error('Invalid graph delta payload:', event.payload);
          return;
        }

        const deltaEvent = event.payload;

        // Validate event-specific data
        switch (deltaEvent.type) {
          case 'node-added':
          case 'node-updated':
            if (!deltaEvent.node || typeof deltaEvent.node !== 'object') {
              console.error('Invalid node in delta event:', deltaEvent);
              return;
            }
            break;
          case 'node-removed':
            if (!deltaEvent.node_id || typeof deltaEvent.node_id !== 'string') {
              console.error('Invalid node_id in delta event:', deltaEvent);
              return;
            }
            break;
          case 'edge-added':
          case 'edge-removed':
            if (!deltaEvent.edge || typeof deltaEvent.edge !== 'object') {
              console.error('Invalid edge in delta event:', deltaEvent);
              return;
            }
            break;
          default:
            console.warn('Unknown delta event type:', deltaEvent);
            return;
        }

        callback(deltaEvent);
      } catch (error) {
        console.error('Error processing graph delta event:', error);
      }
    });
  },
};
