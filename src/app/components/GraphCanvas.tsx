/**
 * GraphCanvas component for rendering the vis-network graph visualization.
 *
 * This component:
 * 1. Creates a NetworkAdapter instance
 * 2. Initializes all services that need the adapter (nodeRepository, cameraMan, colorist)
 * 3. Loads graph data into the visualization
 * 4. Handles physics stabilization and cleanup
 */

import { useRef, useEffect } from 'react';
import { useService } from '../../core/di';
import { NetworkAdapter, DEFAULT_NETWORK_OPTIONS } from '../../infrastructure/vis-network';
import type { GraphData } from '@/shared';

export function GraphCanvas({ graphData }: { graphData?: GraphData | undefined }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const adapterRef = useRef<NetworkAdapter | null>(null);

  const nodeRepository = useService('nodeRepository');
  const cameraMan = useService('cameraMan');
  const colorist = useService('colorist');
  const graphState = useService('graphState');
  const eventBus = useService('eventBus');

  useEffect(() => {
    if (!containerRef.current) {
      return; 
    }

    console.log('Initializing NetworkAdapter...');

    const adapter = new NetworkAdapter();
    adapterRef.current = adapter;

    adapter.initialize(containerRef.current, DEFAULT_NETWORK_OPTIONS);
    nodeRepository.initialize(adapter);
    cameraMan.initialize(adapter);
    colorist.initialize(adapter);

    if(graphData == null) {
      return;
    }

    nodeRepository.setGraphData(graphData);

    const allNodeIds = new Set(graphData.nodes.map(n => n.id));
    graphState.setActiveNodes(allNodeIds);
    colorist.applyColors();

    setTimeout(() => {
      adapter.setPhysics(false);
      cameraMan.fitAll();
    }, 1000);


    return () => {
      colorist.destroy();
      cameraMan.destroy();
      nodeRepository.destroy();
      adapter.destroy();
      adapterRef.current = null;
    };
  }, [nodeRepository, cameraMan, colorist, graphState, eventBus]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ minHeight: '400px' }}
    />
  );
}
