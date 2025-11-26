import { useEffect } from 'react';
import type { Network } from 'vis-network';
import { useGraphStore } from '../../graph/store/graphStore';
import { useColoringStore } from '../store/coloringStore';
import type { NodeType } from '../utils/nodeColors';
import { getNodeStyle, getInactiveNodeStyle } from '../utils/nodeColors';

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
  const graphData = useGraphStore((state) => state.graphData);
  const selectedNodeId = useColoringStore((state) => state.selectedNodeId);
  const focusedNodeId = useColoringStore((state) => state.focusedNodeId);
  const incomingNodeIds = useColoringStore((state) => state.incomingNodeIds);
  const outgoingNodeIds = useColoringStore((state) => state.outgoingNodeIds);
  const activeNodeIds = useColoringStore((state) => state.activeNodeIds);

  useEffect(() => {
    if (!network || !graphData) return;

    // @ts-expect-error - vis-network body property is not in type definitions
    const nodes = network.body.data.nodes;

    const getNodeType = (nodeId: string): NodeType => {
      switch (true) {
        case nodeId === selectedNodeId:
          return 'selected';
        case outgoingNodeIds.has(nodeId):
          return 'outgoing';
        case incomingNodeIds.has(nodeId):
          return 'incoming';
        case graphData.nodes.find((n) => n.id === nodeId)?.group === 'phantom':
          return 'phantom';
        default:
          return 'regular';
      }
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
        return {
          id: node.id,
          ...getInactiveNodeStyle(),
        };
      }

      const type = getNodeType(node.id);
      const isFocused = node.id === focusedNodeId;

      return {
        id: node.id,
        ...getNodeStyle(type, isFocused),
      };
    });

    nodes.update(updates);
  }, [
    network,
    graphData,
    selectedNodeId,
    focusedNodeId,
    incomingNodeIds,
    outgoingNodeIds,
    activeNodeIds,
  ]);
};
