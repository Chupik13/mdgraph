export interface ParsedKey {
  key: string;
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  meta: boolean;
}

export type KeySequence = ParsedKey[];

export interface KeybindingConfig {
  leader: string;
  timeout: number;
  bindings: Record<string, string>;
}

export interface IKeybindingService {
  initialize(config: KeybindingConfig): void;

  handleKeyDown(event: KeyboardEvent): boolean;

  resetSequence(): void;

  getBinding(sequence: string): string | null;

  getAllBindings(): Record<string, string>;
}
