/**
 * Connected node navigation hook.
 *
 * This hook provides navigation through nodes connected to the currently selected
 * node. It cycles through incoming and outgoing connections in clockwise order,
 * like navigating around a clock face from 12 o'clock.
 *
 * @module features/navigation/hooks/useConnectedNavigation
 */

import { useCallback } from 'react';
import { graphDataService } from '../../graph/services/GraphDataService';
import { useColoringStore } from '../../coloring';
import { CameraService } from '../../camera';

/**
 * Hook for navigating through connected nodes in clockwise/counterclockwise order.
 *
 * When a node is selected, this hook allows cycling through all its connected nodes
 * (both incoming and outgoing) sorted by their angular position relative to the
 * selected node, starting from 12 o'clock (north) and proceeding clockwise.
 *
 * @returns Object with next/previous navigation functions
 *
 * @remarks
 * ## Angular Sorting
 * Connected nodes are sorted by angle using the following coordinate system:
 * - 0° = 12 o'clock (north/up)
 * - 90° = 3 o'clock (east/right)
 * - 180° = 6 o'clock (south/down)
 * - 270° = 9 o'clock (west/left)
 *
 * The sorting creates a predictable clockwise traversal pattern that feels natural
 * for exploring node relationships.
 *
 * ## Navigation Behavior
 * - **Next (w key)**: Moves to the next connected node clockwise
 * - **Previous (b key)**: Moves to the previous connected node counterclockwise
 * - **Wraparound**: After the last node, returns to the first (circular)
 * - **No Selection**: If no node is selected, navigation does nothing
 *
 * ## Camera Zoom
 * When navigating to a connected node, the camera zooms to 1.7x (more than
 * standard navigation) to emphasize the connection relationship.
 *
 * ## Performance
 * The connected nodes list is recalculated on each navigation. For graphs with
 * hundreds of connections per node, consider caching the sorted list.
 *
 * @example
 * // In a component
 * const { navigateNextConnected, navigatePrevConnected } = useConnectedNavigation();
 *
 * // Called by keybinding handlers
 * // Press 'w' -> navigateNextConnected()  (clockwise)
 * // Press 'b' -> navigatePrevConnected()  (counterclockwise)
 */
export const useConnectedNavigation = () => {
  const focusNode = useColoringStore(state => state.focusNode);

  /**
   * Gets all connected nodes sorted clockwise by angle.
   *
   * Retrieves the combined list of incoming and outgoing connections from the
   * selected node, calculates their angular positions relative to the selected
   * node, and sorts them clockwise starting from 12 o'clock.
   *
   * @returns Array of node IDs sorted by clockwise angle, or empty array if no selection
   *
   * @remarks
   * ## Angle Calculation
   * 1. Calculate dx and dy from selected node to connected node
   * 2. Use atan2(dy, dx) to get angle in radians
   * 3. Convert to degrees
   * 4. Rotate by +90° and normalize to 0-360° range (makes 0° point up instead of right)
   * 5. Sort nodes by resulting angle
   *
   * ## Mathematical Details
   * The transformation `(angle * 180 / π + 90 + 360) % 360` converts:
   * - atan2 output (0° = right, 90° = down)
   * - to compass bearing (0° = up, 90° = right)
   *
   * ## Edge Cases
   * - If selected node has no connections, returns empty array
   * - If network instance is null, returns empty array
   * - Nodes without position data are assigned angle 0 (treated as north)
   */
  const getConnectedNodesSorted = useCallback((): string[] => {
    const { selectedNodeId, incomingNodeIds, outgoingNodeIds } = useColoringStore.getState();
    const network = graphDataService.getNetwork();

    if (!selectedNodeId || !network || !graphDataService.isReady()) {
      return [];
    }

    const connectedNodeIds = new Set([...incomingNodeIds, ...outgoingNodeIds]);

    if (connectedNodeIds.size === 0) {
      return [];
    }

    const positions = network.getPositions();
    const selectedPos = positions[selectedNodeId];

    if (!selectedPos) {
      return [];
    }

    const nodesWithAngles = Array.from(connectedNodeIds).map(nodeId => {
      const nodePos = positions[nodeId];

      if (!nodePos) {
        return { nodeId, angle: 0 };
      }

      const dx = nodePos.x - selectedPos.x;
      const dy = nodePos.y - selectedPos.y;

      let angle = Math.atan2(dy, dx);

      let degrees = (angle * 180) / Math.PI;

      degrees = (degrees + 90 + 360) % 360;

      return { nodeId, angle: degrees };
    });

    nodesWithAngles.sort((a, b) => a.angle - b.angle);

    return nodesWithAngles.map(item => item.nodeId);
  }, []);

  /**
   * Navigates to the next connected node in clockwise order.
   *
   * Finds the current position in the sorted connected nodes list and moves
   * to the next one. If at the end of the list, wraps around to the beginning.
   *
   * @remarks
   * ## Current Position Detection
   * - If a node is already focused and it's in the connections, starts from there
   * - If no focus or focused node isn't in connections, starts from beginning
   * - Uses modulo arithmetic for wraparound: `(index + 1) % length`
   *
   * ## Empty Connections
   * If the selected node has no connections, logs a message and does nothing.
   * This prevents errors when trying to navigate from isolated nodes.
   *
   * @example
   * // Selected node has 4 connections at: 0°, 90°, 180°, 270°
   * // Currently focused on 90° node
   * navigateNextConnected(); // Moves to 180° node
   * navigateNextConnected(); // Moves to 270° node
   * navigateNextConnected(); // Wraps to 0° node
   */
  const navigateNextConnected = useCallback(() => {
    const { focusedNodeId } = useColoringStore.getState();
    const sortedNodes = getConnectedNodesSorted();

    if (sortedNodes.length === 0) {
      console.log('[ConnectedNav] No connected nodes to navigate');
      return;
    }

    const currentIndex = focusedNodeId ? sortedNodes.indexOf(focusedNodeId) : -1;

    const nextIndex = (currentIndex + 1) % sortedNodes.length;
    const nextNodeId = sortedNodes[nextIndex];

    if (!nextNodeId) return;

    // Use GraphDataService to get node info
    const node = graphDataService.getNode(nextNodeId);
    if (node) {
      console.log('[ConnectedNav] Navigate next:', node.label);
      focusNode(nextNodeId);

      const network = graphDataService.getNetwork();
      if (network) {
        const cameraService = new CameraService(network);
        cameraService.focusOnNode(nextNodeId, 1.7);
      }
    }
  }, [getConnectedNodesSorted, focusNode]);

  /**
   * Navigates to the previous connected node in counterclockwise order.
   *
   * Finds the current position in the sorted connected nodes list and moves
   * to the previous one. If at the beginning of the list, wraps around to the end.
   *
   * @remarks
   * ## Wraparound Logic
   * Uses the formula `(index - 1 + length) % length` to handle:
   * - Normal case: index > 0, simply subtract 1
   * - Wraparound: index = -1 or 0, wraps to length - 1
   *
   * The addition of length before modulo ensures the result is always positive.
   *
   * @example
   * // Selected node has 4 connections at: 0°, 90°, 180°, 270°
   * // Currently focused on 90° node
   * navigatePrevConnected(); // Moves to 0° node
   * navigatePrevConnected(); // Wraps to 270° node
   * navigatePrevConnected(); // Moves to 180° node
   */
  const navigatePrevConnected = useCallback(() => {
    const { focusedNodeId } = useColoringStore.getState();
    const sortedNodes = getConnectedNodesSorted();

    if (sortedNodes.length === 0) {
      return;
    }

    const currentIndex = focusedNodeId ? sortedNodes.indexOf(focusedNodeId) : -1;

    const prevIndex = (currentIndex - 1 + sortedNodes.length) % sortedNodes.length;
    const prevNodeId = sortedNodes[prevIndex];

    if (!prevNodeId) return;

    // Use GraphDataService to get node info
    const node = graphDataService.getNode(prevNodeId);
    if (node) {
      focusNode(prevNodeId);

      const network = graphDataService.getNetwork();
      if (network) {
        const cameraService = new CameraService(network);
        cameraService.focusOnNode(prevNodeId, 1.7);
      }
    }
  }, [getConnectedNodesSorted, focusNode]);

  return {
    navigateNextConnected,
    navigatePrevConnected,
  };
};
