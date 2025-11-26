import { useEffect } from 'react';
import { useColoringStore } from '../../coloring';
import { useCamera } from '../../camera';

/**
 * Hook that automatically focuses camera on selected node and its connections
 * Listens to selectedNodeId changes and fits camera view to include:
 * - Selected node
 * - All incoming nodes
 * - All outgoing nodes
 */
export const useNodeSelection = () => {
  const selectedNodeId = useColoringStore(state => state.selectedNodeId);
  const incomingNodeIds = useColoringStore(state => state.incomingNodeIds);
  const outgoingNodeIds = useColoringStore(state => state.outgoingNodeIds);
  const { cameraService } = useCamera();

  useEffect(() => {
    if (!cameraService) {
      return;
    }

    if (selectedNodeId) {
      const nodesToFit = [
        selectedNodeId,
        ...Array.from(incomingNodeIds),
        ...Array.from(outgoingNodeIds),
      ];

      cameraService.fitAll(nodesToFit);
    }
  }, [selectedNodeId, incomingNodeIds, outgoingNodeIds, cameraService]);
};
