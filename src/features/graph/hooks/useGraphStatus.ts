/**
 * React hook for subscribing to graph service status.
 *
 * Uses useSyncExternalStore for safe subscription to external state,
 * ensuring proper updates during concurrent rendering.
 *
 * @module features/graph/hooks/useGraphStatus
 */

import { useSyncExternalStore } from 'react';
import {
  graphDataService,
  type GraphStatusSnapshot,
} from '../services/GraphDataService';

/**
 * Gets the cached snapshot from the service.
 *
 * Returns the same object reference until status actually changes,
 * preventing infinite render loops.
 */
const getSnapshot = (): GraphStatusSnapshot =>
  graphDataService.getStatusSnapshot();

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
