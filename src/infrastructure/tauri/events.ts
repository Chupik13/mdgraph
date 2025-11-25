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
import type { GraphData } from '../../shared/types';

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
    return listen<GraphData>('graph-update', (event) => {
      callback(event.payload);
    });
  },
};
