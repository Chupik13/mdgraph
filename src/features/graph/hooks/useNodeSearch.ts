import { useEffect } from 'react';
import { useGraphStore } from '../store/graphStore';
import { useColoringStore } from '../../coloring';
import { useCommandLineStore } from '../../command-line/store/commandLineStore';
import { useAppModeStore } from '../../../shared/store/appModeStore';

/**
 * Hook for searching nodes by name (label)
 * Works incrementally - filters on each input change
 *
 * Logic:
 * - In search mode: filters nodes by query (case-insensitive)
 * - Empty query: all nodes active (activeNodeIds = null)
 * - Not in search mode: all nodes active
 */
export const useNodeSearch = () => {
  const graphData = useGraphStore((state) => state.graphData);
  const setActiveNodes = useColoringStore((state) => state.setActiveNodes);
  const input = useCommandLineStore((state) => state.input);
  const currentMode = useAppModeStore((state) => state.currentMode);

  useEffect(() => {
    if (currentMode !== 'search') {
      setActiveNodes(null);
      return;
    }

    if (!graphData) {
      return;
    }

    if (input.trim() === '') {
      setActiveNodes(null);
      return;
    }

    const query = input.toLowerCase();
    const matchedNodeIds = graphData.nodes
      .filter((node) => node.label.toLowerCase().includes(query))
      .map((node) => node.id);

    setActiveNodes(matchedNodeIds);
  }, [currentMode, input, graphData, setActiveNodes]);
};
