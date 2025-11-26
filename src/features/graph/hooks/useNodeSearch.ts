import { useEffect } from 'react';
import { useGraphStore } from '../store/graphStore';
import { useColoringStore } from '../../coloring';
import { useCommandLineStore } from '../../command-line/store/commandLineStore';
import { useAppModeStore } from '../../../shared/store/appModeStore';
import type { Node } from '../../../shared/types';

/**
 * Hook for searching nodes by name (label)
 * Works incrementally - filters on each input change
 *
 * Logic:
 * - In search mode: filters nodes by query (case-insensitive)
 * - Empty query: all nodes active (activeNodeIds = null)
 * - Not in search mode: all nodes active
 *
 * Uses vis-network DataSet as source of truth to include delta-synced nodes.
 */
export const useNodeSearch = () => {
  const networkInstance = useGraphStore(state => state.networkInstance);
  const setActiveNodes = useColoringStore(state => state.setActiveNodes);
  const input = useCommandLineStore(state => state.input);
  const currentMode = useAppModeStore(state => state.currentMode);

  useEffect(() => {
    if (currentMode !== 'search') {
      setActiveNodes(null);
      return;
    }

    if (!networkInstance) {
      return;
    }

    if (input.trim() === '') {
      setActiveNodes(null);
      return;
    }

    // Use vis-network DataSet as source of truth (includes delta-synced nodes)
    // @ts-expect-error - accessing internal vis-network structure
    const nodesDataSet = networkInstance.body.data.nodes;
    const allNodes = nodesDataSet.get() as Node[];

    const query = input.toLowerCase();
    const matchedNodeIds = allNodes
      .filter((node: Node) => node.label.toLowerCase().includes(query))
      .map((node: Node) => node.id);

    setActiveNodes(matchedNodeIds);
  }, [currentMode, input, networkInstance, setActiveNodes]);
};
