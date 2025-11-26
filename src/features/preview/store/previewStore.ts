/**
 * Preview popup state management.
 *
 * This module provides a Zustand store for managing the markdown preview popup
 * state, including visibility, content, and the associated node.
 *
 * @module features/preview/store/previewStore
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * Position for the preview popup.
 */
interface Position {
  x: number;
  y: number;
}

/**
 * Preview store state interface.
 */
interface PreviewState {
  /**
   * Whether the preview popup is currently visible.
   */
  isOpen: boolean;

  /**
   * The markdown content to display in the preview.
   * Null when no content has been loaded.
   */
  content: string | null;

  /**
   * The ID of the node being previewed.
   * Used for context and potential future features.
   */
  nodeId: string | null;

  /**
   * Position of the popup on screen (DOM coordinates).
   * Null when position is not set.
   */
  position: Position | null;

  /**
   * Loading state for async content fetching.
   */
  isLoading: boolean;

  /**
   * Error message if content loading fails.
   */
  error: string | null;

  /**
   * Opens the preview popup with content for a specific node.
   *
   * @param nodeId - The ID of the node to preview
   * @param content - The markdown content to display
   * @param position - Position to display the popup at
   */
  open: (nodeId: string, content: string, position: Position) => void;

  /**
   * Closes the preview popup and clears content.
   */
  close: () => void;

  /**
   * Sets the loading state.
   *
   * @param loading - Whether content is currently loading
   */
  setLoading: (loading: boolean) => void;

  /**
   * Sets an error message.
   *
   * @param error - Error message, or null to clear
   */
  setError: (error: string | null) => void;
}

/**
 * Zustand store for preview popup management.
 */
export const usePreviewStore = create<PreviewState>()(
  devtools(
    (set) => ({
      isOpen: false,
      content: null,
      nodeId: null,
      position: null,
      isLoading: false,
      error: null,

      open: (nodeId, content, position) => {
        set({
          isOpen: true,
          content,
          nodeId,
          position,
          isLoading: false,
          error: null,
        });
      },

      close: () => {
        set({
          isOpen: false,
          content: null,
          nodeId: null,
          position: null,
          error: null,
        });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error, isLoading: false });
      },
    }),
    { name: 'PreviewStore' },
  ),
);
