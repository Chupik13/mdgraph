import { useEffect, useMemo } from 'react';
import { useGraphStore } from '../store/graphStore';
import { useColoringStore } from '../../coloring';
import { useCommandLineStore } from '../../command-line/store/commandLineStore';
import { useAppModeStore } from '../../../shared/store/appModeStore';
import { CameraService, FAST_ANIMATION } from '../../camera';
import { graphDataService } from '../services/GraphDataService';

/**
 * Hook for incremental node search by label with automatic viewport adjustment.
 *
 * Filters nodes in real-time as the user types, highlighting matches and
 * automatically fitting the viewport to show all matching nodes.
 *
 * @remarks
 * ## Search Behavior
 * - **Search mode active**: Filters nodes by case-insensitive substring match
 * - **Empty query**: All nodes shown (activeNodeIds = null)
 * - **Non-search mode**: All nodes shown
 *
 * ## Viewport Behavior
 * On each query change, the camera automatically fits to show all matching nodes
 * using fast animation. This creates a responsive "zoom to results" effect.
 *
 * @example
 * // Used in GraphCanvas to enable search functionality
 * useNodeSearch();
 * // User enters search mode with '/' and types query
 * // Matching nodes are highlighted, camera zooms to fit them
 */
export const useNodeSearch = () => {
  const setActiveNodes = useColoringStore((state) => state.setActiveNodes);
  const input = useCommandLineStore((state) => state.input);
  const currentMode = useAppModeStore((state) => state.currentMode);
  const networkInstance = useGraphStore((state) => state.networkInstance);

  const cameraService = useMemo(() => {
    return networkInstance ? new CameraService(networkInstance) : null;
  }, [networkInstance]);

  useEffect(() => {
    if (currentMode !== 'search') {
      setActiveNodes(null);
      return;
    }

    if (!graphDataService.isReady()) {
      return;
    }

    if (input.trim() === '') {
      setActiveNodes(null);
      cameraService?.fitAll([], FAST_ANIMATION);
      return;
    }

    // Use GraphDataService as single source of truth (includes delta-synced nodes)
    const allNodes = graphDataService.getNodes();

    const query = input.toLowerCase();
    const matchedNodeIds = allNodes
      .filter((node: Node) => node.label.toLowerCase().includes(query))
      .map((node: Node) => node.id);

    setActiveNodes(matchedNodeIds);

    if (matchedNodeIds.length > 0 && cameraService) {
      cameraService.fitAll(matchedNodeIds, FAST_ANIMATION);
    }
  }, [currentMode, input, graphDataService, setActiveNodes, cameraService]);
};
