import { useEffect } from 'react';
import { graphDataService } from '../services/GraphDataService';
import { useColoringStore } from '../../coloring';
import { useCommandLineStore } from '../../command-line/store/commandLineStore';
import { useAppModeStore } from '../../../shared/store/appModeStore';
import type { Node } from '../../../shared/types';

/**
 * Hook for searching nodes by name (label).
 *
 * Works incrementally - filters on each input change.
 *
 * @remarks
 * ## Logic
 * - In search mode: filters nodes by query (case-insensitive)
 * - Empty query: all nodes active (activeNodeIds = null)
 * - Not in search mode: all nodes active
 *
 * Uses GraphDataService as single source of truth for node data.
 */
export const useNodeSearch = () => {
  const setActiveNodes = useColoringStore(state => state.setActiveNodes);
  const input = useCommandLineStore(state => state.input);
  const currentMode = useAppModeStore(state => state.currentMode);

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
      return;
    }

    // Use GraphDataService as single source of truth (includes delta-synced nodes)
    const allNodes = graphDataService.getNodes();

    const query = input.toLowerCase();
    const matchedNodeIds = allNodes
      .filter((node: Node) => node.label.toLowerCase().includes(query))
      .map((node: Node) => node.id);

    setActiveNodes(matchedNodeIds);
  }, [currentMode, input, setActiveNodes]);
};
