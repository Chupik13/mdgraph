/**
 * Search results navigation hook.
 *
 * This hook provides navigation through search results in clockwise order,
 * similar to vim's n/N for search result navigation. Nodes are sorted by
 * their angular position relative to the viewport center.
 *
 * @module features/navigation/hooks/useSearchNavigation
 */

import { useCallback, useMemo } from 'react';
import { graphDataService } from '../../graph/services/GraphDataService';
import { useGraphStatus } from '../../graph/hooks/useGraphStatus';
import { useColoringStore } from '../../coloring';
import { CameraService } from '../../camera';
import { sortNodesByAngle } from '../utils';

/**
 * Hook for navigating through search results in clockwise/counterclockwise order.
 *
 * When search is active (activeNodeIds is set), this hook allows cycling through
 * all matching nodes sorted by their angular position relative to the viewport
 * center, starting from 12 o'clock (north) and proceeding clockwise.
 *
 * @returns Object with next/previous navigation functions
 *
 * @remarks
 * ## Angular Sorting
 * Search results are sorted by angle using the following coordinate system:
 * - 0° = 12 o'clock (north/up)
 * - 90° = 3 o'clock (east/right)
 * - 180° = 6 o'clock (south/down)
 * - 270° = 9 o'clock (west/left)
 *
 * The center point for angle calculation is the current viewport center,
 * making navigation contextual to what the user is currently viewing.
 *
 * ## Navigation Behavior
 * - **Next (n key)**: Moves to the next search result clockwise
 * - **Previous (N key)**: Moves to the previous search result counterclockwise
 * - **Wraparound**: After the last result, returns to the first (circular)
 * - **No Results**: If no search results, navigation does nothing
 *
 * ## Camera Behavior
 * When navigating to a search result, the camera focuses on the node
 * with 1.3x zoom (same as hjkl navigation).
 *
 * @example
 * const { navigateNextSearchResult, navigatePrevSearchResult } = useSearchNavigation();
 *
 * // Called by keybinding handlers
 * // Press 'n' -> navigateNextSearchResult()  (clockwise)
 * // Press 'N' -> navigatePrevSearchResult()  (counterclockwise)
 */
export const useSearchNavigation = () => {
  const { status } = useGraphStatus();
  const focusNode = useColoringStore((state) => state.focusNode);

  const cameraService = useMemo(() => {
    if (status !== 'ready') return null;
    return new CameraService(() => graphDataService.getNetwork());
  }, [status]);

  /**
   * Gets all search result nodes sorted clockwise by angle from viewport center.
   *
   * Retrieves the list of active (matching) nodes from the search, calculates
   * their angular positions relative to the viewport center, and sorts them
   * clockwise starting from 12 o'clock.
   *
   * @returns Array of node IDs sorted by clockwise angle, or empty array if no search results
   *
   * @remarks
   * ## Angle Calculation
   * 1. Get current viewport center position
   * 2. Calculate dx and dy from viewport center to each node
   * 3. Use atan2(dy, dx) to get angle in radians
   * 4. Convert to degrees
   * 5. Rotate by +90° and normalize to 0-360° range (makes 0° point up)
   * 6. Sort nodes by resulting angle
   */
  const getSearchResultsSorted = useCallback((): string[] => {
    const network = graphDataService.getNetwork();
    const activeIds = useColoringStore.getState().activeNodeIds;

    if (!network || !graphDataService.isReady() || !activeIds || activeIds.size === 0) {
      return [];
    }

    const positions = network.getPositions();

    // Вычисляем центр масс всех найденных нод - фиксированная точка отсчёта
    let sumX = 0,
      sumY = 0,
      count = 0;
    activeIds.forEach((nodeId) => {
      const pos = positions[nodeId];
      if (pos) {
        sumX += pos.x;
        sumY += pos.y;
        count++;
      }
    });

    if (count === 0) {
      return Array.from(activeIds);
    }

    const centroid = { x: sumX / count, y: sumY / count };

    return sortNodesByAngle(Array.from(activeIds), positions, centroid);
  }, []);

  /**
   * Navigates to the next search result in clockwise order.
   *
   * Finds the current position in the sorted search results and moves
   * to the next one. If at the end of the list, wraps around to the beginning.
   *
   * @remarks
   * ## Current Position Detection
   * - If a node is already focused and it's in the results, starts from there
   * - If no focus or focused node isn't in results, starts from beginning
   * - Uses modulo arithmetic for wraparound: `(index + 1) % length`
   */
  const navigateNextSearchResult = useCallback(() => {
    const { focusedNodeId } = useColoringStore.getState();
    const sortedNodes = getSearchResultsSorted();

    if (sortedNodes.length === 0) {
      return;
    }

    const currentIndex = focusedNodeId ? sortedNodes.indexOf(focusedNodeId) : -1;
    const nextIndex = (currentIndex + 1) % sortedNodes.length;
    const nextNodeId = sortedNodes[nextIndex];

    if (nextNodeId) {
      focusNode(nextNodeId);
      cameraService?.focusOnNode(nextNodeId, 1.3);
    }
  }, [getSearchResultsSorted, focusNode, cameraService]);

  /**
   * Navigates to the previous search result in counterclockwise order.
   *
   * Finds the current position in the sorted search results and moves
   * to the previous one. If at the beginning of the list, wraps around to the end.
   *
   * @remarks
   * ## Wraparound Logic
   * Uses the formula `(index - 1 + length) % length` to handle:
   * - Normal case: index > 0, simply subtract 1
   * - Wraparound: index = -1 or 0, wraps to length - 1
   */
  const navigatePrevSearchResult = useCallback(() => {
    const { focusedNodeId } = useColoringStore.getState();
    const sortedNodes = getSearchResultsSorted();

    if (sortedNodes.length === 0) {
      return;
    }

    const currentIndex = focusedNodeId ? sortedNodes.indexOf(focusedNodeId) : -1;
    const prevIndex = (currentIndex - 1 + sortedNodes.length) % sortedNodes.length;
    const prevNodeId = sortedNodes[prevIndex];

    if (prevNodeId) {
      focusNode(prevNodeId);
      cameraService?.focusOnNode(prevNodeId, 1.3);
    }
  }, [getSearchResultsSorted, focusNode, cameraService]);

  return {
    navigateNextSearchResult,
    navigatePrevSearchResult,
  };
};
