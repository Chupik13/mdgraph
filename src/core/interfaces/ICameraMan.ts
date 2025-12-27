import type { NetworkAdapter } from '../../infrastructure/vis-network';
import type { Position, AnimationOptions } from '../../infrastructure/vis-network/types';

export type { Position, AnimationOptions };

export interface FocusOptions {
  scale?: number;
  animation?: AnimationOptions;
}

export interface ICameraMan {
  initialize(adapter: NetworkAdapter): void;
  destroy(): void;

  focusOnNode(nodeId: string, options?: FocusOptions): void;
  fitAll(options?: AnimationOptions): void;
  fitToNodes(nodeIds: string[], options?: AnimationOptions): void;

  moveTo(position: Position, scale?: number, options?: AnimationOptions): void;
  zoomIn(step?: number): void;
  zoomOut(step?: number): void;

  getScale(): number;
  getViewPosition(): Position;
}
