import type { NetworkAdapter } from '../../infrastructure/vis-network';

export interface NodeColors {
  border: string;
  background: string;
}

export interface ColorScheme {
  selected: NodeColors;
  focused: NodeColors;
  outgoing: NodeColors;
  incoming: NodeColors;
  phantom: NodeColors;
  regular: NodeColors;
}

export interface IColorist {
  initialize(adapter: NetworkAdapter): void;
  applyColors(): void;
  setColorScheme(colors: Partial<ColorScheme>): void;
  destroy(): void;
}
