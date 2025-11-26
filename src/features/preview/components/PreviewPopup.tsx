/**
 * Preview popup component for displaying markdown content.
 *
 * Renders a modal overlay with rendered markdown content when a node
 * is previewed. Features a semi-transparent dark background, node title
 * header, scrollable content area, and keyboard-accessible navigation.
 *
 * @module features/preview/components/PreviewPopup
 */

import React, { useEffect, useRef } from 'react';
import { usePreviewStore } from '../store/previewStore';
import { MarkdownRenderer } from './MarkdownRenderer';

/**
 * Preview popup component.
 *
 * Displays the markdown preview in a positioned modal with:
 * - Node title as header
 * - Semi-transparent dark backdrop (60% opacity)
 * - Scrollable content container with rendered markdown
 * - Vim-like keyboard navigation (j/k for scroll)
 * - Escape key to close
 *
 * The popup is positioned relative to the previewed node and triggers
 * a blur effect on the graph canvas for visual focus.
 *
 * @returns React component or null if preview is not open
 */
export const PreviewPopup: React.FC = () => {
  const isOpen = usePreviewStore((state) => state.isOpen);
  const content = usePreviewStore((state) => state.content);
  const nodeId = usePreviewStore((state) => state.nodeId);
  const position = usePreviewStore((state) => state.position);
  const isLoading = usePreviewStore((state) => state.isLoading);
  const error = usePreviewStore((state) => state.error);
  const close = usePreviewStore((state) => state.close);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        close();
      }
      if (event.key === 'j') {
        event.preventDefault();
        scrollRef.current?.scrollBy({ top: 100, behavior: 'smooth' });
      }
      if (event.key === 'k') {
        event.preventDefault();
        scrollRef.current?.scrollBy({ top: -100, behavior: 'smooth' });
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, close]);

  if (!isOpen || !position) return null;

  const style: React.CSSProperties = {
    position: 'fixed',
    left: position.x,
    top: position.y,
    transform: 'translateX(-50%)',
    zIndex: 50,
  };

  return (
    <div className="fixed inset-0 z-40" onClick={close}>
      <div
        style={style}
        className="w-96 max-h-[30vh] overflow-hidden rounded-lg bg-gray-950/60 border border-gray-700 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          ref={scrollRef}
          className="overflow-y-auto max-h-[30vh] p-4 scrollbar-hide text-white"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {isLoading && (
            <div className="text-gray-400 text-center py-4">Loading...</div>
          )}

          {error && <div className="text-red-400 text-center py-4">{error}</div>}

          {!isLoading && !error && content && (
            <>
              <h2 className="text-lg font-semibold text-white mb-3">
                {nodeId}
              </h2>
              <MarkdownRenderer content={content} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
