import { useEffect } from 'react';
import type { Network } from 'vis-network';
import type { DataSet } from 'vis-data';
import { useColoringStore } from '../store/coloringStore';
import type { NodeType } from '../utils/nodeColors';
import { getNodeStyle, getInactiveNodeStyle } from '../utils/nodeColors';
import type { Node } from '../../../shared/types';

/**
 * Hook for managing node colors in the graph visualization.
 *
 * Updates node styles based on selection state, focus, search filtering,
 * and connection relationships. This hook reads directly from the vis-network
 * DataSet to ensure it works with delta-synced nodes.
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
    if (!network) return;

    // Type-safe access to internal vis-network structure
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const networkBody = (network as any).body;
    if (!networkBody?.data?.nodes) {
      console.warn('useNodeColoring: vis-network body structure not available');
      return;
    }

    const nodesDataSet = networkBody.data.nodes as DataSet<Node>;
    const allNodeIds = nodesDataSet.getIds() as string[];

    const getNodeType = (nodeId: string): NodeType => {
      const node = nodesDataSet.get(nodeId);

      // Priority order matters: selected > outgoing/incoming > phantom > regular
      if (nodeId === selectedNodeId) return 'selected';
      if (outgoingNodeIds.has(nodeId)) return 'outgoing';
      if (incomingNodeIds.has(nodeId)) return 'incoming';
      if (node?.group === 'phantom') return 'phantom';
      return 'regular';
    };

    const updates = allNodeIds.map(nodeId => {
      const isInactive = activeNodeIds !== null && !activeNodeIds.has(nodeId);

      if (isInactive) {
        return { id: nodeId, ...getInactiveNodeStyle() };
      }

      const type = getNodeType(nodeId);
      const isFocused = nodeId === focusedNodeId;

      return { id: nodeId, ...getNodeStyle(type, isFocused) };
    });

    nodesDataSet.update(updates);
  }, [network, selectedNodeId, focusedNodeId, incomingNodeIds, outgoingNodeIds, activeNodeIds]);
};
