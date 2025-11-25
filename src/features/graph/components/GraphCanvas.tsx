import React, { useRef } from 'react';
import { useGraphStore } from '../store/graphStore';
import { useGraphNetwork } from '../hooks/useGraphNetwork';
import { useNodeSearch } from '../hooks/useNodeSearch';
import { useNodeSelection } from '../hooks/useNodeSelection';
import { useNodeColoring } from '../../coloring';

export const GraphCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphData = useGraphStore((state) => state.graphData);
  const isLoading = useGraphStore((state) => state.isLoading);
  const error = useGraphStore((state) => state.error);

  const { network } = useGraphNetwork(containerRef, graphData);

  useNodeColoring(network);
  useNodeSearch();
  useNodeSelection();

  return (
    <div className="relative w-full h-full bg-transparent">
      {/* vis-network */}
      <div ref={containerRef} className="w-full h-full" data-testid="graph-canvas" />

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90">
          <div className="max-w-md p-6 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Graph loading error</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {!isLoading && !error && (!graphData || graphData.nodes.length === 0) && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-lg font-medium mb-2">No data to display</p>
            <p className="text-sm text-gray-400">Select a directory with markdown files</p>
          </div>
        </div>
      )}
    </div>
  );
};
