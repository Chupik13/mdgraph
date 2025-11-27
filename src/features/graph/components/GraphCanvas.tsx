/**
 * Graph canvas component for vis-network visualization.
 *
 * This module provides the main canvas container for rendering the knowledge graph
 * using vis-network. It integrates multiple features including node coloring,
 * search highlighting, selection handling, and preview blur effects.
 *
 * @module features/graph/components/GraphCanvas
 */

import React, { useRef } from 'react';
import { useGraphNetwork } from '../hooks/useGraphNetwork';
import { useGraphDeltaSync } from '../hooks/useGraphDeltaSync';
import { useNodeSearch } from '../hooks/useNodeSearch';
import { useNodeSelection } from '../hooks/useNodeSelection';
import { useGraphStatus } from '../hooks/useGraphStatus';
import { useNodeColoring } from '../../coloring';
import { usePreviewStore } from '../../preview/store/previewStore';

/**
 * Main graph visualization canvas component.
 *
 * Renders the vis-network graph inside a container div and coordinates
 * multiple visualization features through hooks. Applies a subtle blur
 * effect when the preview popup is open to focus attention on the preview.
 *
 * @returns Graph canvas container with vis-network visualization
 *
 * @remarks
 * ## Integrated Features
 * - **Node coloring**: Dynamic color updates based on selection state
 * - **Search**: Highlights matching nodes during search mode
 * - **Selection**: Tracks focused and selected nodes
 * - **Preview blur**: Applies 2px blur when preview popup is open
 *
 * ## Error States
 * Displays appropriate UI for loading errors and empty graph states.
 *
 * @example
 * <GraphCanvas />
 */
export const GraphCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { status, error, initialData } = useGraphStatus();
  const isPreviewOpen = usePreviewStore((state) => state.isOpen);

  const { network } = useGraphNetwork(containerRef, initialData);

  useNodeColoring(network);
  useNodeSearch();
  useNodeSelection();
  useGraphDeltaSync(network);

  return (
    <div className={`relative w-full h-full bg-transparent transition-[filter] duration-200 ${isPreviewOpen ? 'blur-[2px]' : ''}`}>
      {/* vis-network */}
      <div ref={containerRef} className="w-full h-full" data-testid="graph-canvas" />

      {status === 'error' && error && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-white/90"
          role="alert"
          aria-live="assertive"
        >
          <div className="max-w-md p-6 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Graph loading error</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {status === 'idle' && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-lg font-medium mb-2">No data to display</p>
            <p className="text-sm text-gray-400">
              Select a directory with markdown files to begin visualization. Use hjkl keys for
              navigation once loaded.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
