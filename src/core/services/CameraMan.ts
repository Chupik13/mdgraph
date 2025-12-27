import type { ICameraMan, FocusOptions, Position, AnimationOptions, IEventBus } from '../interfaces';
import type { NetworkAdapter } from '../../infrastructure/vis-network';

const DEFAULT_ZOOM_STEP = 0.2;

export class CameraMan implements ICameraMan {
  private adapter: NetworkAdapter | null = null;
  private unsubscribeFocus: (() => void) | null = null;

  constructor(private eventBus: IEventBus) {}

  initialize(adapter: NetworkAdapter): void {
    this.adapter = adapter;

    // Subscribe to focus changes - move camera when focus changes
    // Done in initialize() because React StrictMode can call destroy() multiple times
    this.unsubscribeFocus = this.eventBus.on('graphState:focusChanged', (payload: unknown) => {
      const { current } = payload as { current: string | null };
      if (current) {
        this.focusOnNode(current);
      }
    });
  }

  destroy(): void {
    this.unsubscribeFocus?.();
    this.unsubscribeFocus = null;
    this.adapter = null;
  }

  focusOnNode(nodeId: string, options?: FocusOptions): void {
    this.adapter?.focusOnNode(nodeId, options?.scale, options?.animation);
  }

  fitAll(options?: AnimationOptions): void {
    this.adapter?.fitToNodes(undefined, options);
  }

  fitToNodes(nodeIds: string[], options?: AnimationOptions): void {
    this.adapter?.fitToNodes(nodeIds, options);
  }

  moveTo(position: Position, scale?: number, options?: AnimationOptions): void {
    this.adapter?.moveTo(position, scale, options);
  }

  zoomIn(step: number = DEFAULT_ZOOM_STEP): void {
    if (!this.adapter) return;
    const currentScale = this.adapter.getScale();
    const position = this.adapter.getViewPosition();
    this.adapter.moveTo(position, currentScale + step);
  }

  zoomOut(step: number = DEFAULT_ZOOM_STEP): void {
    if (!this.adapter) return;
    const currentScale = this.adapter.getScale();
    const newScale = Math.max(0.1, currentScale - step);
    const position = this.adapter.getViewPosition();
    this.adapter.moveTo(position, newScale);
  }

  getScale(): number {
    return this.adapter?.getScale() ?? 1;
  }

  getViewPosition(): Position {
    return this.adapter?.getViewPosition() ?? { x: 0, y: 0 };
  }
}
