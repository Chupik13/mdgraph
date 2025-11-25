/**
 * Camera viewport state management store.
 *
 * This module provides a Zustand store for tracking the current viewport state
 * of the graph visualization, including zoom level (scale), camera position, and
 * animation status. The camera state is synchronized with vis-network's viewport.
 *
 * @module features/camera/store/cameraStore
 */

import { create } from 'zustand';

/**
 * Camera state interface for viewport management.
 *
 * Tracks the camera's current scale, position, and whether an animation is in
 * progress. This state is typically updated by camera service operations and
 * can be used to display viewport information in the UI.
 */
interface CameraState {
  /**
   * Current zoom scale of the viewport.
   * 1.0 represents 100% zoom (normal), > 1.0 is zoomed in, < 1.0 is zoomed out.
   */
  scale: number;

  /**
   * Current center position of the viewport in graph coordinate space.
   */
  position: { x: number; y: number };

  /**
   * Indicates whether a camera animation is currently in progress.
   * Useful for disabling user interactions during animations or showing loading states.
   */
  isAnimating: boolean;

  /**
   * Sets the camera scale (zoom level).
   *
   * @param scale - New zoom scale value (1.0 = 100%)
   */
  setScale: (scale: number) => void;

  /**
   * Sets the camera position.
   *
   * @param position - New camera center position in graph coordinates
   */
  setPosition: (position: { x: number; y: number }) => void;

  /**
   * Sets the animation state.
   *
   * Should be set to true when starting a camera animation and false when complete.
   *
   * @param isAnimating - Animation state boolean
   */
  setIsAnimating: (isAnimating: boolean) => void;

  /**
   * Updates both scale and position simultaneously.
   *
   * Convenience method for updating camera state in a single operation,
   * typically called after vis-network viewport changes.
   *
   * @param scale - New zoom scale value
   * @param position - New camera center position
   */
  updateCamera: (scale: number, position: { x: number; y: number }) => void;
}

/**
 * Zustand store for managing camera viewport state.
 *
 * This store maintains the current viewport state of the graph visualization.
 * It is typically updated by the CameraService when performing camera operations
 * like zooming, panning, or focusing on nodes.
 *
 * @remarks
 * - Initial scale is 1.0 (100% zoom)
 * - Initial position is origin (0, 0)
 * - Not animated by default
 *
 * @example
 * // Get current zoom level
 * const scale = useCameraStore((state) => state.scale);
 *
 * @example
 * // Update camera state after zoom
 * const updateCamera = useCameraStore((state) => state.updateCamera);
 * updateCamera(1.5, { x: 100, y: 200 });
 *
 * @example
 * // Check if animation is in progress
 * const isAnimating = useCameraStore((state) => state.isAnimating);
 * if (isAnimating) {
 *   console.log('Camera is currently animating');
 * }
 */
export const useCameraStore = create<CameraState>((set) => ({
  scale: 1.0,
  position: { x: 0, y: 0 },
  isAnimating: false,

  setScale: (scale) => set({ scale }),
  setPosition: (position) => set({ position }),
  setIsAnimating: (isAnimating) => set({ isAnimating }),
  updateCamera: (scale, position) => set({ scale, position }),
}));
