import { useEffect } from 'react';
import type { Network } from 'vis-network';
import { graphDataService } from '../../graph/services/GraphDataService';
import { useColoringStore } from '../store/coloringStore';
import type { NodeType } from '../utils/nodeColors';
import { getNodeStyle, getInactiveNodeStyle, getPhantomNodeStyle } from '../utils/nodeColors';

/**
 * Hook for managing node colors in the graph visualization.
 *
 * Updates node styles based on selection state, focus, search filtering,
 * and connection relationships. This hook uses GraphDataService as the
 * single source of truth for node data.
 *
 * @param network - The vis-network instance to apply coloring to
 *
 * @remarks
 * ## Color States
 * Nodes can be in multiple visual states:
 * - **Selected**: User clicked on this node
 * - **Focused**: Keyboard navigation is on this node (highlighted border)
 * - **Outgoing**: Node is connected from selected node
 * - **Incoming**: Node connects to selected node
 * - **Inactive**: Node is filtered out by search (dimmed)
 * - **Phantom**: Node represents a broken link (dashed border)
 *
 * ## Performance
 * This hook triggers on every state change. For large graphs (>1000 nodes),
 * consider adding memoization or batching updates.
 */
export const useNodeColoring = (network: Network | null) => {
  const selectedNodeId = useColoringStore(state => state.selectedNodeId);
  const focusedNodeId = useColoringStore(state => state.focusedNodeId);
  const incomingNodeIds = useColoringStore(state => state.incomingNodeIds);
  const outgoingNodeIds = useColoringStore(state => state.outgoingNodeIds);
  const activeNodeIds = useColoringStore(state => state.activeNodeIds);

  useEffect(() => {
    if (!network || !graphDataService.isReady()) return;

    // Track mounted state to prevent updates after unmount
    let isMounted = true;

    const allNodeIds = graphDataService.getNodeIds();

    const getNodeType = (nodeId: string): NodeType => {
      // Priority order matters: selected > outgoing/incoming > phantom > regular
      if (nodeId === selectedNodeId) return 'selected';
      if (outgoingNodeIds.has(nodeId)) return 'outgoing';
      if (incomingNodeIds.has(nodeId)) return 'incoming';
      if (graphDataService.isPhantom(nodeId)) return 'phantom';
      return 'regular';
    };

    /**
     * Computes the effective set of active (visible) nodes, extending search
     * results to include the selected node and its connections.
     *
     * @returns Extended active node set, or null if no filtering is active
     */
    const getEffectiveActiveNodes = (): Set<string> | null => {
      if (activeNodeIds === null) return null;

      if (selectedNodeId) {
        const extendedActiveNodes = new Set(activeNodeIds);
        extendedActiveNodes.add(selectedNodeId);
        incomingNodeIds.forEach((id) => extendedActiveNodes.add(id));
        outgoingNodeIds.forEach((id) => extendedActiveNodes.add(id));
        return extendedActiveNodes;
      }

      return activeNodeIds;
    };

    const effectiveActiveNodes = getEffectiveActiveNodes();

    const updates = allNodeIds.map((nodeId) => {
      const isInactive = effectiveActiveNodes !== null && !effectiveActiveNodes.has(nodeId);

      if (isInactive) {
        return { id: nodeId, ...getInactiveNodeStyle() };
      }

      const type = getNodeType(nodeId);
      const isFocused = nodeId === focusedNodeId;

      // Phantom nodes need special style with borderDashes
      if (type === 'phantom') {
        return { id: nodeId, ...getPhantomNodeStyle(isFocused) };
      }

      return { id: nodeId, ...getNodeStyle(type, isFocused) };
    });

    // Batch update all nodes at once for better performance
    // Check isMounted to prevent updates after component unmount
    if (isMounted) {
      graphDataService.updateNodes(updates);
    }

    return () => {
      isMounted = false;
    };
  }, [network, selectedNodeId, focusedNodeId, incomingNodeIds, outgoingNodeIds, activeNodeIds]);
};
