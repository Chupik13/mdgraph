/**
 * Hook for synchronizing graph delta events with vis-network.
 *
 * This hook handles incremental updates to the graph visualization by listening
 * to backend file watcher events and applying changes through GraphDataService.
 * This approach preserves node positions and avoids full graph redraws.
 *
 * @module features/graph/hooks/useGraphDeltaSync
 */

import { useEffect, useRef } from 'react';
import type { Network } from 'vis-network';
import type { UnlistenFn } from '@tauri-apps/api/event';

import { TauriEvents } from '../../../infrastructure/tauri/events';
import { graphDataService } from '../services/GraphDataService';
import {
  getPhantomNodeStyle,
  getRegularNodeStyle,
  getInactiveNodeStyle,
  useColoringStore,
} from '../../coloring';
import { useAppModeStore } from '../../../shared/store/appModeStore';
import { useCommandLineStore } from '../../command-line/store/commandLineStore';

/**
 * Synchronizes graph delta events from the backend with vis-network visualization.
 *
 * When the backend file watcher detects changes to markdown files, it emits delta
 * events (node-added, node-removed, edge-added, edge-removed). This hook:
 * 1. Subscribes to these events via Tauri
 * 2. Applies changes through GraphDataService (single source of truth)
 * 3. Temporarily enables physics for smooth node repositioning
 *
 * @param network - vis-network instance to update, or null if not yet initialized
 *
 * @remarks
 * ## Physics Management
 * After any graph change, physics is temporarily enabled for 500ms (debounced) to
 * allow new nodes to naturally position themselves. Physics is disabled using
 * `stopSimulation()` followed by `setOptions({ physics: false })`. The `stopSimulation()`
 * call is critical — without it, `setOptions()` alone does not reliably stop physics.
 *
 * ## Position Preservation
 * Existing nodes maintain their positions. New nodes are positioned by vis-network's
 * physics simulation near their connected nodes.
 *
 * ## Single Source of Truth
 * All mutations go through GraphDataService, which owns the DataSet.
 *
 * @example
 * function GraphCanvas() {
 *   const { network } = useGraphNetwork(containerRef, graphData);
 *   useGraphDeltaSync(network);
 *   return <div ref={containerRef} />;
 * }
 */
export const useGraphDeltaSync = (network: Network | null) => {
  const networkRef = useRef<Network | null>(null);
  networkRef.current = network;

  useEffect(() => {
    if (!network) return;

    let unlisten: UnlistenFn | undefined;
    let physicsTimeout: ReturnType<typeof setTimeout> | null = null;
    let isPhysicsActive = false;

    /**
     * Temporarily enables physics for smooth node repositioning.
     * Uses debouncing to handle rapid sequential events.
     * Physics is disabled after 500ms using stopSimulation() + setOptions().
     */
    const enablePhysicsTemporarily = () => {
      const currentNetwork = networkRef.current;
      if (!currentNetwork) return;

      if (physicsTimeout) {
        clearTimeout(physicsTimeout);
      }

      if (!isPhysicsActive) {
        isPhysicsActive = true;
        currentNetwork.setOptions({ physics: { enabled: true } });

        // Lock camera on focused node during physics
        const focusedId = useColoringStore.getState().focusedNodeId;
        if (focusedId) {
          currentNetwork.focus(focusedId, { locked: true, animation: false });
        }
      }

      physicsTimeout = setTimeout(() => {
        // Use ref to get current network value (may be null if unmounted)
        if (!networkRef.current) return;
        networkRef.current.stopSimulation();
        networkRef.current.setOptions({ physics: { enabled: false } });
        isPhysicsActive = false;
      }, 500);
    };

    // Subscribe to delta events
    TauriEvents.onGraphDelta(event => {
      const currentNetwork = networkRef.current;
      if (!currentNetwork || !graphDataService.isReady()) return;

      switch (event.type) {
        case 'node-added': {
          const { activeNodeIds, setActiveNodes } = useColoringStore.getState();
          const currentMode = useAppModeStore.getState().currentMode;
          const searchQuery = useCommandLineStore.getState().input;

          // Check if search is active and if node matches query
          const isSearchActive =
            currentMode === 'search' && activeNodeIds !== null && searchQuery.trim() !== '';
          const matchesSearch =
            isSearchActive && event.node.label.toLowerCase().includes(searchQuery.toLowerCase());

          // Apply appropriate style based on search state
          const baseStyle =
            event.node.group === 'phantom' ? getPhantomNodeStyle() : getRegularNodeStyle();
          const style = isSearchActive && !matchesSearch ? getInactiveNodeStyle() : baseStyle;

          // Add node through GraphDataService (single source of truth)
          graphDataService.addNode({ ...event.node, ...style });

          // Update activeNodeIds only if node matches search
          if (isSearchActive && matchesSearch) {
            const newActiveIds = [...activeNodeIds, event.node.id];
            setActiveNodes(newActiveIds);
          }
          break;
        }

        case 'node-removed': {
          // Release camera lock before removing node to prevent _lockedRedraw crash
          const viewPosition = currentNetwork.getViewPosition();
          currentNetwork.moveTo({ position: viewPosition, animation: false });

          // Remove node through GraphDataService
          graphDataService.removeNode(event.node_id);

          // Clear focus/selection if pointing to removed node
          const {
            focusedNodeId,
            selectedNodeId,
            focusNode,
            clearSelection,
            activeNodeIds,
            setActiveNodes,
          } = useColoringStore.getState();

          if (focusedNodeId === event.node_id) {
            focusNode(null);
          }
          if (selectedNodeId === event.node_id) {
            clearSelection();
          }

          // Remove from activeNodeIds if present
          if (activeNodeIds && activeNodeIds.has(event.node_id)) {
            const newActiveIds = Array.from(activeNodeIds).filter(id => id !== event.node_id);
            setActiveNodes(newActiveIds.length > 0 ? newActiveIds : null);
          }
          break;
        }

        case 'node-updated': {
          // Update node through GraphDataService
          graphDataService.updateNode({
            id: event.node.id,
            label: event.node.label,
            value: event.node.value,
            group: event.node.group,
          });
          break;
        }

        case 'edge-added': {
          // Add edge through GraphDataService (handles deduplication)
          graphDataService.addEdge(event.edge);
          break;
        }

        case 'edge-removed': {
          // Remove edge through GraphDataService
          graphDataService.removeEdge(event.edge);
          break;
        }
      }

      // Enable physics temporarily after any graph change
      currentNetwork.redraw();
      enablePhysicsTemporarily();
    }).then(fn => {
      unlisten = fn;
    });

    return () => {
      if (physicsTimeout) clearTimeout(physicsTimeout);
      unlisten?.();
    };
  }, [network]);
};
