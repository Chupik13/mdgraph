import { useEffect } from 'react';
import type { Network } from 'vis-network';
import { useGraphStore } from '../../graph/store/graphStore';
import { useColoringStore } from '../store/coloringStore';
import type { NodeType } from '../utils/nodeColors';
import { getNodeStyle, getInactiveNodeStyle } from '../utils/nodeColors';

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

    const updates = graphData.nodes.map((node) => {
      const isInactive = activeNodeIds !== null && !activeNodeIds.has(node.id);

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
