/**
 * Graph synchronization service for real-time backend updates.
 *
 * This module provides a React hook that automatically synchronizes the frontend
 * graph state with backend updates. It subscribes to Tauri events and updates
 * the graph data service whenever the backend emits new graph data.
 *
 * @module infrastructure/services/GraphSyncService
 */

import { useEffect } from 'react';
import { graphDataService } from '../../features/graph/services/GraphDataService';
import { TauriEvents } from '../tauri/events';

/**
 * Hook for synchronizing graph data with backend updates.
 *
 * This hook sets up a subscription to the `graph-update` Tauri event and
 * automatically updates the graph data service whenever new data arrives from the
 * backend. It handles cleanup on unmount to prevent memory leaks.
 *
 * @returns void - This hook has no return value and only manages side effects
 *
 * @remarks
 * - Should be called once at the application root level (e.g., in App.tsx)
 * - Automatically subscribes on mount and unsubscribes on unmount
 * - Updates are applied immediately to the graph data service without batching
 * - The complete graph data is replaced on each update (no delta merging)
 *
 * @example
 * // In App.tsx or root component
 * function App() {
 *   useGraphSync(); // Sets up automatic synchronization
 *
 *   return (
 *     <div>
 *       <GraphCanvas />
 *     </div>
 *   );
 * }
 */
export const useGraphSync = () => {
  useEffect(() => {
    let unlisten: (() => void) | undefined;

    TauriEvents.onGraphUpdate(graphData => {
      graphDataService.setInitialData(graphData);
    }).then(unlistenFn => {
      unlisten = unlistenFn;
    });

    return () => {
      if (unlisten) unlisten();
    };
  }, []);
};
