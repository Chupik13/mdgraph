/**
 * Hook for initializing and managing the vis-network graph instance.
 *
 * This hook handles the complete lifecycle of a vis-network visualization instance,
 * including creation, configuration, physics stabilization, and cleanup. It applies
 * node styling based on node types (regular vs phantom) and manages the ready state.
 *
 * @module features/graph/hooks/useGraphNetwork
 */

import { useEffect, useState, type RefObject } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { getVisNetworkOptions } from '../utils/visNetworkConfig';
import { getPhantomNodeStyle, getRegularNodeStyle } from '../../coloring';
import { useGraphStore } from '../store/graphStore';
import type { GraphData } from '../../../shared/types';

/**
 * Creates and manages a vis-network graph visualization instance.
 *
 * This hook initializes a new vis-network instance when graph data becomes available,
 * applies appropriate styling to nodes based on their type, and handles the physics
 * simulation lifecycle. It automatically cleans up the network instance when the
 * component unmounts or when dependencies change.
 *
 * @param containerRef - React ref to the DOM element that will contain the visualization
 * @param graphData - Graph data with nodes and edges, or null if not yet loaded
 * @returns Object containing the network instance and ready state
 *
 * @remarks
 * ## Physics Stabilization
 * The hook runs physics simulation on initialization to arrange nodes in a visually
 * pleasing layout. Physics is automatically disabled after:
 * - The network stabilizes (nodes stop moving significantly)
 * - OR after 1 second timeout (fallback for large graphs)
 *
 * This prevents unnecessary CPU usage after the initial layout is established.
 *
 * ## Node Styling
 * Nodes are styled based on their `group` property:
 * - `phantom` nodes: Get special dashed border style to indicate broken links
 * - Regular nodes: Get standard node appearance
 *
 * ## Lifecycle Management
 * - Creates network when containerRef and graphData are both available
 * - Stores network instance in global graph store for access by other features
 * - Destroys network and cleans up on unmount or when dependencies change
 * - Clears stabilization timeout to prevent memory leaks
 *
 * @example
 * function GraphCanvas() {
 *   const containerRef = useRef<HTMLDivElement>(null);
 *   const graphData = useGraphStore((state) => state.graphData);
 *   const { network, isReady } = useGraphNetwork(containerRef, graphData);
 *
 *   return (
 *     <div>
 *       <div ref={containerRef} style={{ width: '100%', height: '600px' }} />
 *       {!isReady && <LoadingSpinner />}
 *     </div>
 *   );
 * }
 */
export const useGraphNetwork = (
  containerRef: RefObject<HTMLDivElement | null>,
  graphData: GraphData | null,
) => {
  const [network, setNetwork] = useState<Network | null>(null);
  const [isReady, setIsReady] = useState(false);
  const setNetworkInstance = useGraphStore((state) => state.setNetworkInstance);

  useEffect(() => {
    if (!containerRef.current || !graphData) return;

    const options = getVisNetworkOptions();

    const nodesDataSet = new DataSet(
      graphData.nodes.map((node) => {
        const baseNode: any = JSON.parse(JSON.stringify(node));

        if (node.group === 'phantom') {
          return { ...baseNode, ...getPhantomNodeStyle() };
        }

        return { ...baseNode, ...getRegularNodeStyle() };
      }),
    );

    const edgesDataSet = new DataSet(
      graphData.edges.map((edge: any) => JSON.parse(JSON.stringify(edge))),
    );

    const networkInstance = new Network(
      containerRef.current,
      {
        nodes: nodesDataSet,
        edges: edgesDataSet,
      },
      options,
    );

    networkInstance.once('stabilized', () => {
      networkInstance.setOptions({ physics: { enabled: false } });
      setIsReady(true);
    });

    const timeout = setTimeout(() => {
      if (networkInstance) {
        networkInstance.stopSimulation();
        networkInstance.setOptions({ physics: { enabled: false } });
        setIsReady(true);
      }
    }, 1000);

    setNetwork(networkInstance);
    setNetworkInstance(networkInstance);

    return () => {
      clearTimeout(timeout);
      networkInstance.destroy();
      setNetwork(null);
      setNetworkInstance(null);
      setIsReady(false);
    };
  }, [containerRef, graphData, setNetworkInstance]);

  return { network, isReady };
};
