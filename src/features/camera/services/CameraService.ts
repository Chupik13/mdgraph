/**
 * Camera service for graph viewport management.
 *
 * This module provides a high-level service class for controlling the graph camera
 * (viewport). It wraps vis-network's camera API with a cleaner interface and provides
 * pre-configured animation presets for consistent motion design.
 *
 * @module features/camera/services/CameraService
 */

import type { Network, EasingFunction } from 'vis-network';

/**
 * Default animation configuration for camera movements.
 * Provides a balanced 300ms duration with smooth easing.
 */
export const DEFAULT_ANIMATION = {
  duration: 300,
  easingFunction: 'easeInOutQuad' as EasingFunction,
} as const;

/**
 * Slow animation configuration for emphasis.
 * Used for major transitions like reset zoom or fit all operations.
 */
export const SLOW_ANIMATION = {
  duration: 500,
  easingFunction: 'easeInOutQuad' as EasingFunction,
} as const;

/**
 * Fast animation configuration for quick feedback.
 * Used for incremental operations or rapid UI responses.
 */
export const FAST_ANIMATION = {
  duration: 150,
  easingFunction: 'easeInOutQuad' as EasingFunction,
} as const;

/**
 * Options for customizing camera animations.
 */
export interface CameraAnimationOptions {
  /**
   * Animation duration in milliseconds.
   * Shorter durations feel snappier, longer durations feel smoother.
   */
  duration?: number;

  /**
   * Easing function for animation progression.
   * Common values: 'linear', 'easeInQuad', 'easeOutQuad', 'easeInOutQuad'.
   */
  easingFunction?: EasingFunction;
}

/**
 * Service class for managing graph camera (viewport) operations.
 *
 * Provides a high-level API for all camera operations including zoom, pan, focus,
 * and fit operations. Wraps vis-network's camera functionality with consistent
 * animation defaults and a cleaner interface.
 *
 * @remarks
 * This service is stateless and operates directly on the vis-network instance.
 * Camera state should be tracked separately in the camera store if needed.
 *
 * @example
 * const network = new Network(container, data, options);
 * const cameraService = new CameraService(network);
 *
 * // Focus on a specific node
 * cameraService.focusOnNode('node1');
 *
 * // Zoom in by 30%
 * cameraService.zoomIn(30);
 *
 * // Reset to fit all nodes
 * cameraService.resetZoom();
 */
export class CameraService {
  private network: Network;

  /**
   * Creates a new CameraService instance.
   *
   * @param network - The vis-network instance to control
   */
  constructor(network: Network) {
    this.network = network;
  }

  /**
   * Focuses the camera on a specific node with zoom.
   *
   * Centers the viewport on the specified node and optionally zooms to a
   * specified scale. Useful for highlighting search results or implementing
   * node navigation.
   *
   * @param nodeId - ID of the node to focus on
   * @param scale - Zoom level (1.0 = 100%, 1.3 = 130%, 2.0 = 200%)
   *                Default is 1.3 for slight zoom emphasis
   * @param animation - Optional animation configuration
   *
   * @remarks
   * The camera is not locked after focusing, allowing the user to immediately
   * interact with the viewport.
   *
   * @example
   * // Focus with default zoom (1.3x)
   * cameraService.focusOnNode('note1');
   *
   * @example
   * // Focus with custom zoom and fast animation
   * cameraService.focusOnNode('note1', 2.0, FAST_ANIMATION);
   */
  focusOnNode(
    nodeId: string,
    scale: number = 1.3,
    animation: CameraAnimationOptions = DEFAULT_ANIMATION
  ): void {
    this.network.focus(nodeId, {
      scale,
      locked: false,
      animation: {
        duration: animation.duration ?? DEFAULT_ANIMATION.duration,
        easingFunction: animation.easingFunction ?? DEFAULT_ANIMATION.easingFunction,
      },
    });
  }

  /**
   * Zooms in (closer) by a relative percentage from the current zoom level.
   *
   * Increases the zoom scale multiplicatively. For example, at 100% zoom, zooming
   * in by 30% results in 130% zoom. At 200% zoom, zooming in by 30% results in 260%.
   *
   * @param percent - Percentage to zoom in (30 = +30% of current scale)
   * @param animation - Optional animation configuration
   *
   * @example
   * // Zoom in by default 30%
   * cameraService.zoomIn();
   *
   * @example
   * // Zoom in by 50% with slow animation
   * cameraService.zoomIn(50, SLOW_ANIMATION);
   */
  zoomIn(percent: number = 30, animation: CameraAnimationOptions = DEFAULT_ANIMATION): void {
    const currentScale = this.network.getScale();
    const multiplier = 1 + percent / 100;
    const newScale = currentScale * multiplier;

    this.network.moveTo({
      scale: newScale,
      animation: {
        duration: animation.duration ?? DEFAULT_ANIMATION.duration,
        easingFunction: animation.easingFunction ?? DEFAULT_ANIMATION.easingFunction,
      },
    });
  }

  /**
   * Zooms out (farther) by a relative percentage from the current zoom level.
   *
   * Decreases the zoom scale multiplicatively. For example, at 100% zoom, zooming
   * out by 30% results in 70% zoom. At 200% zoom, zooming out by 30% results in 140%.
   *
   * @param percent - Percentage to zoom out (30 = -30% of current scale)
   * @param animation - Optional animation configuration
   *
   * @example
   * // Zoom out by default 30%
   * cameraService.zoomOut();
   *
   * @example
   * // Zoom out by 50% with fast animation
   * cameraService.zoomOut(50, FAST_ANIMATION);
   */
  zoomOut(percent: number = 30, animation: CameraAnimationOptions = DEFAULT_ANIMATION): void {
    const currentScale = this.network.getScale();
    const multiplier = 1 - percent / 100;
    const newScale = currentScale * multiplier;

    this.network.moveTo({
      scale: newScale,
      animation: {
        duration: animation.duration ?? DEFAULT_ANIMATION.duration,
        easingFunction: animation.easingFunction ?? DEFAULT_ANIMATION.easingFunction,
      },
    });
  }

  /**
   * Resets the zoom to fit all graph nodes into the visible area.
   *
   * Automatically calculates the optimal zoom level and position to display
   * all nodes in the viewport. This is a convenience wrapper around `fitAll()`.
   *
   * @param animation - Optional animation configuration (defaults to SLOW_ANIMATION)
   *
   * @remarks
   * Uses a slower animation by default to give users time to reorient themselves
   * when the view changes significantly.
   *
   * @example
   * // Reset with default slow animation
   * cameraService.resetZoom();
   *
   * @example
   * // Reset with custom animation
   * cameraService.resetZoom({ duration: 400, easingFunction: 'easeOutQuad' });
   */
  resetZoom(animation: CameraAnimationOptions = SLOW_ANIMATION): void {
    this.fitAll([], animation);
  }

  /**
   * Fits specified nodes (or all nodes) into the visible viewport area.
   *
   * Automatically calculates the optimal zoom level and camera position to
   * display the specified nodes. If no nodes are specified, fits all graph nodes.
   *
   * @param nodeIds - Optional array of node IDs to fit. If omitted or empty,
   *                  fits all nodes in the graph.
   * @param animation - Optional animation configuration (defaults to SLOW_ANIMATION)
   *
   * @example
   * // Fit all nodes
   * cameraService.fitAll();
   *
   * @example
   * // Fit specific nodes with custom animation
   * cameraService.fitAll(['node1', 'node2', 'node3'], FAST_ANIMATION);
   */
  fitAll(nodeIds?: string[], animation: CameraAnimationOptions = SLOW_ANIMATION): void {
    this.network.fit({
      nodes: nodeIds,
      animation: {
        duration: animation.duration ?? SLOW_ANIMATION.duration,
        easingFunction: animation.easingFunction ?? SLOW_ANIMATION.easingFunction,
      },
    });
  }

  /**
   * Moves the camera to specified coordinates with optional zoom.
   *
   * Pans the camera to the specified position in graph coordinate space,
   * optionally changing the zoom level simultaneously.
   *
   * @param x - X coordinate in graph space
   * @param y - Y coordinate in graph space
   * @param scale - Optional zoom level (omit to maintain current zoom)
   * @param animation - Optional animation configuration
   *
   * @remarks
   * Graph coordinates are independent of screen/canvas coordinates. Use node
   * positions from the graph data or getViewPosition() to get valid coordinates.
   *
   * @example
   * // Pan to position without changing zoom
   * cameraService.moveToPosition(100, 200);
   *
   * @example
   * // Pan and zoom simultaneously
   * cameraService.moveToPosition(100, 200, 1.5);
   */
  moveToPosition(
    x: number,
    y: number,
    scale?: number,
    animation: CameraAnimationOptions = DEFAULT_ANIMATION
  ): void {
    this.network.moveTo({
      position: { x, y },
      scale,
      animation: {
        duration: animation.duration ?? DEFAULT_ANIMATION.duration,
        easingFunction: animation.easingFunction ?? DEFAULT_ANIMATION.easingFunction,
      },
    });
  }

  /**
   * Gets the current zoom level.
   *
   * @returns Current scale value (1.0 = 100% zoom, 2.0 = 200%, 0.5 = 50%)
   *
   * @example
   * const currentZoom = cameraService.getCurrentZoom();
   * console.log(`Current zoom: ${(currentZoom * 100).toFixed(0)}%`);
   */
  getCurrentZoom(): number {
    return this.network.getScale();
  }

  /**
   * Gets the current camera center position.
   *
   * @returns Object containing x and y coordinates in graph space
   *
   * @example
   * const position = cameraService.getCurrentPosition();
   * console.log(`Camera at: ${position.x}, ${position.y}`);
   */
  getCurrentPosition(): { x: number; y: number } {
    return this.network.getViewPosition();
  }

  /**
   * Sets an absolute zoom level.
   *
   * Changes the zoom to a specific value rather than adjusting it relatively.
   * The camera position remains unchanged unless combined with other operations.
   *
   * @param scale - Target zoom level (1.0 = 100%, 2.0 = 200%, 0.5 = 50%)
   * @param animation - Optional animation configuration
   *
   * @example
   * // Set zoom to exactly 150%
   * cameraService.setZoom(1.5);
   *
   * @example
   * // Set zoom with fast animation
   * cameraService.setZoom(2.0, FAST_ANIMATION);
   */
  setZoom(scale: number, animation: CameraAnimationOptions = DEFAULT_ANIMATION): void {
    this.network.moveTo({
      scale,
      animation: {
        duration: animation.duration ?? DEFAULT_ANIMATION.duration,
        easingFunction: animation.easingFunction ?? DEFAULT_ANIMATION.easingFunction,
      },
    });
  }
}
