/**
 * React hook for subscribing to graph service status.
 *
 * Uses useSyncExternalStore for safe subscription to external state,
 * ensuring proper updates during concurrent rendering.
 *
 * @module features/graph/hooks/useGraphStatus
 */

import { useSyncExternalStore } from 'react';
import { graphDataService, type GraphStatus } from '../services/GraphDataService';
import type { GraphData } from '../../../shared/types';

/**
 * Snapshot shape returned by getSnapshot.
 */
interface GraphStatusSnapshot {
  status: GraphStatus;
  error: string | null;
  initialData: GraphData | null;
}

/**
 * Creates a snapshot of the current graph status.
 * Called by useSyncExternalStore to get the current state.
 */
const getSnapshot = (): GraphStatusSnapshot => ({
  status: graphDataService.getStatus(),
  error: graphDataService.getError(),
  initialData: graphDataService.getInitialData(),
});

/**
 * Server-side snapshot for SSR (if ever needed).
 */
const getServerSnapshot = (): GraphStatusSnapshot => ({
  status: 'idle',
  error: null,
  initialData: null,
});

/**
 * Subscribes to graph service status and data changes.
 *
 * Uses a single subscription to avoid creating multiple callbacks
 * for each status field. This ensures only one re-render per status change.
 *
 * @returns Object with current status, error message, and initial graph data
 *
 * @example
 * ```typescript
 * const { status, error, initialData } = useGraphStatus();
 *
 * if (status === 'loading') return <Spinner />;
 * if (status === 'error') return <Error message={error} />;
 * if (status === 'ready') return <Graph data={initialData} />;
 * ```
 */
export const useGraphStatus = (): GraphStatusSnapshot => {
  return useSyncExternalStore(
    callback => graphDataService.subscribeToStatus(callback),
    getSnapshot,
    getServerSnapshot
  );
};
