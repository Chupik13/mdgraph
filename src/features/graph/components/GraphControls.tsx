import React, { memo } from 'react';
import { useGraphStore } from '../store/graphStore';
import { useCameraStore } from '../../camera';

interface GraphControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitAll: () => void;
}

export const GraphControls: React.FC<GraphControlsProps> = memo(({ onZoomIn, onZoomOut, onFitAll }) => {
  const scale = useCameraStore((state) => state.scale);
  const nodeCount = useGraphStore((state) => state.graphData?.nodes.length ?? 0);

  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2 bg-white rounded-lg shadow-lg p-2">
      <button
        onClick={onZoomIn}
        className="p-2 hover:bg-gray-100 rounded transition-colors"
        aria-label="Zoom in"
        title="Zoom in (+)"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>

      <button
        onClick={onZoomOut}
        className="p-2 hover:bg-gray-100 rounded transition-colors"
        aria-label="Zoom out"
        title="Zoom out (-)"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>

      <button
        onClick={onFitAll}
        className="p-2 hover:bg-gray-100 rounded transition-colors"
        aria-label="Fit all nodes"
        title="Fit all nodes (f)"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
          />
        </svg>
      </button>

      <div className="text-xs text-gray-500 text-center mt-2 border-t pt-2">
        <div>{nodeCount} nodes</div>
        <div>{Math.round(scale * 100)}%</div>
      </div>
    </div>
  );
});

GraphControls.displayName = 'GraphControls';
