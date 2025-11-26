import { useEffect } from 'react';
import type { Network } from 'vis-network';
import type { DataSet } from 'vis-data';
import { useColoringStore } from '../store/coloringStore';
import type { NodeType } from '../utils/nodeColors';
import { getNodeStyle, getInactiveNodeStyle } from '../utils/nodeColors';
import type { Node } from '../../../shared/types';

/**
 * Hook for applying visual styles to graph nodes based on selection and search state.
 *
 * Manages node coloring for different states: selected, focused, incoming/outgoing
 * connections, phantom nodes, and search-filtered (inactive) nodes.
 *
 * @param network - vis-network instance to apply styles to
 *
 * @remarks
 * ## Node Types and Colors
 * - **selected**: Currently selected node (green)
 * - **focused**: Node under cursor/navigation focus (highlighted border)
 * - **incoming**: Nodes linking TO selected node (blue)
 * - **outgoing**: Nodes linked FROM selected node (orange)
 * - **phantom**: Broken links / non-existent files (gray)
 * - **regular**: Default state
 * - **inactive**: Dimmed during search when not matching query
 *
 * ## Search Mode Behavior
 * When search is active (activeNodeIds is set), non-matching nodes are dimmed.
 * However, if a node is selected, its connections (incoming/outgoing) remain
 * visible even if they don't match the search query. This allows exploring
 * relationships while searching.
 *
 * @example
 * const { network } = useGraphNetwork(containerRef, graphData);
 * useNodeColoring(network);
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

    const updates = graphData.nodes.map((node) => {
      const isInactive = effectiveActiveNodes !== null && !effectiveActiveNodes.has(node.id);

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
