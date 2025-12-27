import type { IKeybindingService, ICommandRegistry, ParsedKey, KeybindingConfig } from '../interfaces';

interface TrieNode {
  children: Map<string, TrieNode>;
  commandId: string | null;
}

const SPECIAL_KEYS: Record<string, string> = {
  Space: ' ',
  Tab: 'Tab',
  Enter: 'Enter',
  Escape: 'Escape',
  BS: 'Backspace',
  Backspace: 'Backspace',
  Del: 'Delete',
  Delete: 'Delete',
  Up: 'ArrowUp',
  Down: 'ArrowDown',
  Left: 'ArrowLeft',
  Right: 'ArrowRight',
};

export class KeybindingService implements IKeybindingService {
  private root: TrieNode = this.createNode();
  private currentNode: TrieNode = this.root;
  private pendingKeys: string[] = [];
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private leader: string = ' ';
  private timeout: number = 500;
  private bindings: Record<string, string> = {};

  constructor(private commandRegistry: ICommandRegistry) {}

  initialize(config: KeybindingConfig): void {
    this.leader = config.leader ?? ' ';
    this.timeout = config.timeout ?? 500;
    this.bindings = { ...config.bindings };

    this.root = this.createNode();
    this.currentNode = this.root;
    this.pendingKeys = [];

    const sequenceStarters = new Set<string>();

    for (const [notation] of Object.entries(config.bindings)) {
      const sequence = this.parseNotation(notation);

      if (sequence.length > 1) {
        const firstKey = sequence[0];
        if (firstKey) {
          sequenceStarters.add(this.keyToString(firstKey));
        }
      }
    }

    for (const [notation, commandId] of Object.entries(config.bindings)) {
      const sequence = this.parseNotation(notation);

      if (sequence.length === 1) {
        const firstKey = sequence[0];
        if (firstKey) {
          const keyStr = this.keyToString(firstKey);
          if (sequenceStarters.has(keyStr)) {
            throw new Error(
              `Keybinding conflict: "${notation}" cannot be bound as a single key ` +
                `because it starts other sequences. Remove conflicting bindings.`
            );
          }
        }
      }

      this.addToTrie(sequence, commandId);
    }
  }

  handleKeyDown(event: KeyboardEvent): boolean {
    if (this.shouldIgnoreEvent(event)) {
      return false;
    }

    const parsedKey = this.parseKeyboardEvent(event);
    const keyStr = this.keyToString(parsedKey);

    const nextNode = this.currentNode.children.get(keyStr);

    if (nextNode) {
      this.clearTimeout();

      event.preventDefault();
      event.stopPropagation();

      this.pendingKeys.push(this.formatKeyForDisplay(parsedKey));
      this.currentNode = nextNode;

      if (nextNode.commandId && nextNode.children.size === 0) {
        this.executeAndReset(nextNode.commandId);
      } else if (nextNode.commandId) {
        this.startTimeout(() => {
          this.executeAndReset(nextNode.commandId!);
        });
      } else {
        this.startTimeout(() => {
          this.resetSequence();
        });
      }

      return true;
    } else if (this.currentNode !== this.root) {
      const fromRoot = this.root.children.get(keyStr);
      if (fromRoot) {
        this.resetSequence();
        return this.handleKeyDown(event);
      } else {
        this.resetSequence();
        return false;
      }
    }

    // At root and no match - not our key
    return false;
  }

  resetSequence(): void {
    this.clearTimeout();
    this.currentNode = this.root;
    this.pendingKeys = [];
  }

  getBinding(sequence: string): string | null {
    return this.bindings[sequence] ?? null;
  }

  getAllBindings(): Record<string, string> {
    return { ...this.bindings };
  }

  // ============ Private Methods ============

  private createNode(): TrieNode {
    return {
      children: new Map(),
      commandId: null,
    };
  }

  private addToTrie(sequence: ParsedKey[], commandId: string): void {
    let node = this.root;

    for (const key of sequence) {
      const keyStr = this.keyToString(key);

      if (!node.children.has(keyStr)) {
        node.children.set(keyStr, this.createNode());
      }

      node = node.children.get(keyStr)!;
    }

    node.commandId = commandId;
  }

  /**
   * Parse vim-style key notation into array of ParsedKey.
   *
   * Supported formats:
   * - Single key: "j", "k", "G"
   * - Sequence: "gg", "dd"
   * - Modifiers: "<C-x>", "<S-j>", "<A-x>", "<M-x>", "<D-x>"
   * - Combined: "<C-S-x>"
   * - Special: "<Space>", "<Escape>", "<Enter>"
   * - Leader: "<leader>" (replaced with configured leader key)
   */
  private parseNotation(notation: string): ParsedKey[] {
    const result: ParsedKey[] = [];
    let i = 0;

    while (i < notation.length) {
      if (notation[i] === '<') {
        // Find closing bracket
        const closeIdx = notation.indexOf('>', i);
        if (closeIdx === -1) {
          throw new Error(`Invalid notation: unclosed bracket in "${notation}"`);
        }

        const content = notation.slice(i + 1, closeIdx);
        result.push(this.parseAngleBracket(content));
        i = closeIdx + 1;
      } else {
        // Single character key
        const char = notation[i];
        if (char) {
          // Uppercase letter = shift modifier
          const isUpperCase = char >= 'A' && char <= 'Z';
          const parsed = this.createParsedKey(isUpperCase ? char.toLowerCase() : char);
          if (isUpperCase) {
            parsed.shift = true;
          }
          result.push(parsed);
        }
        i++;
      }
    }

    return result;
  }

  /**
   * Parse content inside angle brackets: C-x, S-j, Space, leader, etc.
   */
  private parseAngleBracket(content: string): ParsedKey {
    // Handle leader
    if (content.toLowerCase() === 'leader') {
      return this.createParsedKey(this.leader);
    }

    // Handle special keys without modifiers
    if (SPECIAL_KEYS[content]) {
      return this.createParsedKey(SPECIAL_KEYS[content]);
    }

    // Handle modifiers: C-x, S-j, C-S-x, etc.
    const parts = content.split('-');
    if (parts.length < 2) {
      // Unknown single token - treat as special key or error
      throw new Error(`Unknown key notation: <${content}>`);
    }

    const modifiers = parts.slice(0, -1);
    let key = parts[parts.length - 1] ?? '';

    // Check if key is a special key
    const specialKey = SPECIAL_KEYS[key];
    if (specialKey) {
      key = specialKey;
    }

    const parsed = this.createParsedKey(key);

    for (const mod of modifiers) {
      switch (mod.toUpperCase()) {
        case 'C':
          parsed.ctrl = true;
          break;
        case 'S':
          parsed.shift = true;
          break;
        case 'A':
        case 'M':
          parsed.alt = true;
          break;
        case 'D':
          parsed.meta = true;
          break;
        default:
          throw new Error(`Unknown modifier: ${mod} in <${content}>`);
      }
    }

    return parsed;
  }

  private createParsedKey(key: string): ParsedKey {
    return {
      key,
      ctrl: false,
      shift: false,
      alt: false,
      meta: false,
    };
  }

  /**
   * Convert ParsedKey to string for trie lookup.
   * Format: [modifiers]-[key]
   */
  private keyToString(parsed: ParsedKey): string {
    const mods: string[] = [];
    if (parsed.ctrl) mods.push('C');
    if (parsed.shift) mods.push('S');
    if (parsed.alt) mods.push('A');
    if (parsed.meta) mods.push('D');

    const modStr = mods.length > 0 ? mods.join('') + '-' : '';
    return modStr + parsed.key.toLowerCase();
  }

  /**
   * Parse KeyboardEvent into ParsedKey.
   */
  private parseKeyboardEvent(event: KeyboardEvent): ParsedKey {
    // Get the key, handling special cases
    let key = event.key;

    // For single printable characters, use the key directly
    // For special keys, event.key is already correct (e.g., "Escape", "Enter")

    return {
      key,
      ctrl: event.ctrlKey,
      shift: event.shiftKey,
      alt: event.altKey,
      meta: event.metaKey,
    };
  }

  /**
   * Format ParsedKey for display (e.g., in status bar).
   */
  private formatKeyForDisplay(parsed: ParsedKey): string {
    const parts: string[] = [];
    if (parsed.ctrl) parts.push('C');
    if (parsed.shift) parts.push('S');
    if (parsed.alt) parts.push('A');
    if (parsed.meta) parts.push('D');

    let keyDisplay = parsed.key;
    if (parsed.key === ' ') keyDisplay = 'Space';
    if (parsed.key === 'Escape') keyDisplay = 'Esc';

    if (parts.length > 0) {
      return `<${parts.join('-')}-${keyDisplay}>`;
    }
    return keyDisplay;
  }

  private shouldIgnoreEvent(event: KeyboardEvent): boolean {
    const target = event.target as HTMLElement;
    if (!target) return false;

    const tagName = target.tagName.toLowerCase();
    const isInput = tagName === 'input' || tagName === 'textarea' || tagName === 'select';
    const isEditable = target.isContentEditable;

    return isInput || isEditable;
  }

  private executeAndReset(commandId: string): void {
    this.resetSequence();
    this.commandRegistry.execute(commandId).catch((err) => {
      console.error(`Error executing command "${commandId}":`, err);
    });
  }

  private startTimeout(callback: () => void): void {
    this.clearTimeout();
    this.timeoutId = setTimeout(callback, this.timeout);
  }

  private clearTimeout(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
