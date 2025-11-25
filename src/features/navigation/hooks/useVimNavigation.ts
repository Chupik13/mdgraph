/**
 * Vim-style directional navigation hook.
 *
 * This hook provides hjkl-style directional navigation for the graph, allowing
 * users to move focus between nodes based on their spatial positions. It calculates
 * the nearest node in each cardinal direction and moves the camera accordingly.
 *
 * @module features/navigation/hooks/useVimNavigation
 */

import { useCallback, useMemo } from 'react';
import { useGraphStore } from '../../graph/store/graphStore';
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

    let focusedNodeId = useColoringStore((state) => state.focusedNodeId);
    const activeNodeIds = useColoringStore((state) => state.activeNodeIds);
    const graphData = useGraphStore((state) => state.graphData);
    const focusNode = useColoringStore((state) => state.focusNode);
    const networkInstance = useGraphStore((state) => state.networkInstance);

    const cameraService = useMemo(() => {
        return networkInstance ? new CameraService(networkInstance) : null;
    }, [networkInstance]);

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

            if (!graphData || !networkInstance) {
                return null;
            }

            if(!focusedNodeId) {
                if(activeNodeIds && activeNodeIds.size > 0) {
                    focusedNodeId = Array.from(activeNodeIds)[0]!;
                } else {
                    focusedNodeId = graphData.nodes[0]?.id!;
                }
            }

            const positions = networkInstance.getPositions();
            const currentPos = positions[focusedNodeId];

            if (!currentPos) {
                return null;
            }

            let bestNode: Node | null = null;
            let bestScore = Infinity;

            graphData.nodes.forEach((node) => {
                if (node.id === focusedNodeId) {
                    if(!activeNodeIds || activeNodeIds.size !== 1) {
                        return;
                    }
                }

                if(activeNodeIds && !activeNodeIds.has(node.id)) {
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
        [focusedNodeId, graphData, networkInstance, activeNodeIds],
    );

    /**
     * Navigates to a specific node by ID.
     *
     * Updates the focused node in the store and moves the camera to center
     * on the node with slight zoom.
     *
     * @param nodeId - ID of the node to navigate to
     */
    const navigateToNode = (nodeId: string) => {
            focusNode(nodeId);
            if(cameraService) {
                cameraService.focusOnNode(nodeId, 1.3);
            }
    }

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
        }, [findNearestNodeInDirection, focusNode, navigateToNode, cameraService]),

        /**
         * Navigates to the nearest node to the right.
         * Bound to 'l' key in vim-style navigation.
         */
        navigateRight: useCallback(() => {
            const node = findNearestNodeInDirection('right');
            if (node) {
                navigateToNode(node.id);
            }
        }, [findNearestNodeInDirection, focusNode, navigateToNode, cameraService]),

        /**
         * Navigates to the nearest node above.
         * Bound to 'k' key in vim-style navigation.
         */
        navigateUp: useCallback(() => {
            const node = findNearestNodeInDirection('up');
            if (node) {
                navigateToNode(node.id);
            }
        }, [findNearestNodeInDirection, focusNode, navigateToNode, cameraService]),

        /**
         * Navigates to the nearest node below.
         * Bound to 'j' key in vim-style navigation.
         */
        navigateDown: useCallback(() => {
            const node = findNearestNodeInDirection('down');
            if (node) {
                navigateToNode(node.id);
            }
        }, [findNearestNodeInDirection, focusNode, navigateToNode, cameraService]),
    };
};
