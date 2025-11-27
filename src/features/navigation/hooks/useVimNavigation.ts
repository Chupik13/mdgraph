/**
 * Vim-style directional navigation hook.
 *
 * This hook provides hjkl-style directional navigation for the graph, allowing
 * users to move focus between nodes based on their spatial positions. It calculates
 * the nearest node in each cardinal direction and moves the camera accordingly.
 *
 * @module features/navigation/hooks/useVimNavigation
 */

import { useCallback } from 'react';
import { graphDataService } from '../../graph/services/GraphDataService';
import { useColoringStore } from '../../coloring';
import { CameraService } from '../../camera';
import type { Node } from '../../../shared/types';

/**
 * Hook providing vim-style directional navigation (hjkl).
 *
 * Implements spatial navigation where pressing h/j/k/l moves focus to the
 * nearest node in the left/down/up/right direction respectively. The algorithm
 * considers both distance and directional alignment when selecting the next node.
 *
 * @returns Object with navigation functions for each direction
 *
 * @remarks
 * ## Navigation Algorithm
 * For each direction, the hook:
 * 1. Gets current focused node position from vis-network
 * 2. Iterates through all nodes to find candidates in that direction
 * 3. Scores each candidate based on distance and perpendicular offset
 * 4. Selects the node with the lowest score (closest and most aligned)
 *
 * ## Directional Scoring
 * The algorithm uses a weighted score:
 * - Primary factor: Euclidean distance to candidate
 * - Secondary factor: Perpendicular distance * 2 (heavily penalizes misalignment)
 *
 * This means a node that's slightly farther but better aligned will be preferred
 * over a closer node that's off to the side.
 *
 * ## Active Node Filtering
 * When search/filtering is active (`activeNodeIds` is set), navigation is
 * restricted to only the active nodes. This prevents navigating to hidden nodes.
 *
 * ## Initial Focus
 * If no node is focused when navigation starts:
 * - If search is active: Focus the first active node
 * - Otherwise: Focus the first node in the graph
 *
 * ## Camera Integration
 * Each navigation action automatically moves the camera to focus on the target
 * node with 1.3x zoom for emphasis.
 *
 * @example
 * // In a component
 * const { navigateLeft, navigateRight, navigateUp, navigateDown } = useVimNavigation();
 *
 * // Navigation functions are called by keybinding handlers
 * // Press 'h' -> navigateLeft()
 * // Press 'l' -> navigateRight()
 * // Press 'k' -> navigateUp()
 * // Press 'j' -> navigateDown()
 */
export const useVimNavigation = () => {
  const focusedNodeId = useColoringStore(state => state.focusedNodeId);
  const activeNodeIds = useColoringStore(state => state.activeNodeIds);
  const focusNode = useColoringStore(state => state.focusNode);

  /**
   * Gets nodes from GraphDataService (single source of truth).
   * This reads runtime state and works with dynamically added nodes.
   */
  const getNodesFromNetwork = useCallback((): Node[] => {
    return graphDataService.getNodes();
  }, []);

  /**
   * Gets the effective focused node ID, with fallback logic.
   *
   * If no node is currently focused:
   * - Returns first active node if search is active
   * - Returns first node in graph otherwise
   *
   * @returns Node ID to use as navigation origin, or null if no nodes available
   */
  const getEffectiveFocusedNodeId = useCallback((): string | null => {
    if (focusedNodeId) {
      return focusedNodeId;
    }

    const nodes = getNodesFromNetwork();
    if (nodes.length === 0) {
      return null;
    }

    if (activeNodeIds && activeNodeIds.size > 0) {
      return Array.from(activeNodeIds)[0] ?? null;
    }

    return nodes[0]?.id ?? null;
  }, [focusedNodeId, activeNodeIds, getNodesFromNetwork]);

  /**
   * Finds the nearest node in a specified direction.
   *
   * Searches through all nodes to find the best candidate based on positional
   * scoring. Only considers nodes that are actually in the specified direction
   * from the current focus.
   *
   * @param direction - Cardinal direction to search ('left', 'right', 'up', 'down')
   * @returns The best candidate node, or null if none found
   *
   * @remarks
   * ## Directional Checks
   * - **left**: dx <= 0 (target is to the left or at same x)
   * - **right**: dx >= 0 (target is to the right or at same x)
   * - **up**: dy <= 0 (target is above or at same y, note: y increases downward)
   * - **down**: dy >= 0 (target is below or at same y)
   *
   * ## Scoring Formula
   * ```
   * score = distance + |perpendicular_offset| * 2
   * ```
   * Where:
   * - distance = Euclidean distance to candidate
   * - perpendicular_offset = distance in the perpendicular axis
   * - The *2 multiplier strongly favors aligned nodes
   *
   * ## Edge Cases
   * - If only one active node exists, it can navigate to itself
   * - If network instance is missing, returns null
   * - If no nodes are in the specified direction, returns null
   */
  const findNearestNodeInDirection = useCallback(
    (direction: 'left' | 'right' | 'up' | 'down'): Node | null => {
      const nodes = getNodesFromNetwork();
      const network = graphDataService.getNetwork();

      if (nodes.length === 0 || !network) {
        return null;
      }

      const effectiveFocusedId = getEffectiveFocusedNodeId();
      if (!effectiveFocusedId) {
        return null;
      }

      const positions = network.getPositions();
      const currentPos = positions[effectiveFocusedId];

      if (!currentPos) {
        return null;
      }

      let bestNode: Node | null = null;
      let bestScore = Infinity;

      nodes.forEach(node => {
        // Skip current node unless it's the only active node
        if (node.id === effectiveFocusedId) {
          if (!activeNodeIds || activeNodeIds.size !== 1) {
            return;
          }
        }

        // Skip nodes not in active set when filtering is active
        if (activeNodeIds && !activeNodeIds.has(node.id)) {
          return;
        }

        const nodePos = positions[node.id];
        if (!nodePos) {
          return;
        }

        const dx = nodePos.x - currentPos.x;
        const dy = nodePos.y - currentPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        let isInDirection = false;
        let directionalScore = Infinity;

        switch (direction) {
          case 'left':
            if (dx <= 0) {
              isInDirection = true;
              directionalScore = distance + Math.abs(dy) * 2;
            }
            break;
          case 'down':
            if (dy >= 0) {
              isInDirection = true;
              directionalScore = distance + Math.abs(dx) * 2;
            }
            break;
          case 'up':
            if (dy <= 0) {
              isInDirection = true;
              directionalScore = distance + Math.abs(dx) * 2;
            }
            break;
          case 'right':
            if (dx >= 0) {
              isInDirection = true;
              directionalScore = distance + Math.abs(dy) * 2;
            }
            break;
        }

        if (isInDirection && directionalScore < bestScore) {
          bestScore = directionalScore;
          bestNode = node;
        }
      });

      return bestNode;
    },
    [getNodesFromNetwork, activeNodeIds, getEffectiveFocusedNodeId]
  );

  /**
   * Navigates to a specific node by ID.
   *
   * Updates the focused node in the store and moves the camera to center
   * on the node with slight zoom.
   *
   * @param nodeId - ID of the node to navigate to
   */
  const navigateToNode = useCallback(
    (nodeId: string) => {
      focusNode(nodeId);
      const network = graphDataService.getNetwork();
      if (network) {
        const cameraService = new CameraService(() => graphDataService.getNetwork());
        cameraService.focusOnNode(nodeId, 1.3);
      }
    },
    [focusNode]
  );

  return {
    /**
     * Navigates to the nearest node to the left.
     * Bound to 'h' key in vim-style navigation.
     */
    navigateLeft: useCallback(() => {
      const node = findNearestNodeInDirection('left');
      if (node) {
        navigateToNode(node.id);
      }
    }, [findNearestNodeInDirection, navigateToNode]),

    /**
     * Navigates to the nearest node to the right.
     * Bound to 'l' key in vim-style navigation.
     */
    navigateRight: useCallback(() => {
      const node = findNearestNodeInDirection('right');
      if (node) {
        navigateToNode(node.id);
      }
    }, [findNearestNodeInDirection, navigateToNode]),

    /**
     * Navigates to the nearest node above.
     * Bound to 'k' key in vim-style navigation.
     */
    navigateUp: useCallback(() => {
      const node = findNearestNodeInDirection('up');
      if (node) {
        navigateToNode(node.id);
      }
    }, [findNearestNodeInDirection, navigateToNode]),

    /**
     * Navigates to the nearest node below.
     * Bound to 'j' key in vim-style navigation.
     */
    navigateDown: useCallback(() => {
      const node = findNearestNodeInDirection('down');
      if (node) {
        navigateToNode(node.id);
      }
    }, [findNearestNodeInDirection, navigateToNode]),
  };
};
