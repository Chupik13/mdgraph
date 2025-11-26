/**
 * Keybinding configuration state management.
 *
 * This module provides a Zustand store for managing keyboard shortcuts with
 * localStorage persistence. It handles keybinding lookup, modifier key matching,
 * and user customization of keyboard shortcuts.
 *
 * @module features/keybindings/store/keybindingStore
 */

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { defaultKeybindings } from '../config/defaultKeybindings';

/**
 * Union type of all available keybinding actions.
 *
 * Actions are namespaced by feature for organization:
 * - `graph.*` - Graph-specific operations (navigation, selection, etc.)
 * - `viewport.*` - Camera/viewport operations (zoom, fit, etc.)
 * - `navigation.*` - History navigation (back/forward)
 * - `app.*` - Application-level commands (command palette, modes, etc.)
 *
 * @remarks
 * When adding new actions:
 * 1. Add the action string literal to this union type
 * 2. Implement the action handler in `useKeybindings` hook
 * 3. Add default keybinding in `defaultKeybindings.ts`
 */
export type KeybindingAction =
  | 'graph.selectUp'
  | 'graph.selectDown'
  | 'graph.selectLeft'
  | 'graph.selectRight'
  | 'graph.selectFocusedNode'
  | 'graph.focusNextConnected'
  | 'graph.focusPrevConnected'
  | 'graph.focusNode'
  | 'graph.deleteNode'
  | 'graph.openNode'
  | 'graph.renameNode'
  | 'viewport.zoomIn'
  | 'viewport.zoomOut'
  | 'viewport.resetZoom'
  | 'viewport.fitAll'
  | 'navigation.back'
  | 'navigation.forward'
  | 'app.toggleSidebar'
  | 'app.openCommandPalette'
  | 'app.openCommandMode'
  | 'app.openSearchMode'
  | 'app.escape';

/**
 * Keybinding definition interface.
 *
 * Defines a single keyboard shortcut with its associated action and metadata.
 */
export interface Keybinding {
  /**
   * The primary key to match (e.g., 'h', 'Enter', 'Escape').
   * Uses KeyboardEvent.key values for consistency.
   */
  key: string;

  /**
   * Optional modifier keys required for this binding.
   * All specified modifiers must be pressed for the binding to match.
   */
  modifiers?: {
    /** Ctrl/Cmd key required */
    ctrl?: boolean;
    /** Shift key required */
    shift?: boolean;
  };

  /**
   * The action to execute when this keybinding is triggered.
   */
  action: KeybindingAction;

  /**
   * Human-readable description of what this keybinding does.
   * Used for displaying keybinding help/documentation.
   */
  description: string;
}

/**
 * Keybinding store state interface.
 *
 * Manages the list of active keybindings and provides lookup functionality.
 */
interface KeybindingState {
  /**
   * Array of all registered keybindings.
   * Can be customized by users and persisted to localStorage.
   */
  keybindings: Keybinding[];

  /**
   * Global enable/disable flag for all keybindings.
   * When false, no keyboard shortcuts will be processed.
   */
  isEnabled: boolean;

  /**
   * Finds the action associated with a keyboard event.
   *
   * Searches through registered keybindings to find a match based on:
   * - Primary key (event.key)
   * - Ctrl modifier (event.ctrlKey)
   * - Shift modifier (event.shiftKey)
   *
   * @param event - The keyboard event to match against
   * @returns The associated action if a matching keybinding is found, null otherwise
   *
   * @remarks
   * Matching logic:
   * - Key must match exactly (case-sensitive)
   * - Modifiers must match exactly (if specified, must be pressed; if not specified, must not be pressed)
   * - Returns the first matching keybinding (order matters)
   * - Returns null if keybindings are disabled or no match found
   *
   * @example
   * const action = findAction(event);
   * if (action === 'graph.selectLeft') {
   *   // Handle left navigation
   * }
   */
  findAction: (event: KeyboardEvent) => KeybindingAction | null;
}

/**
 * Zustand store for keybinding management.
 *
 * This store combines multiple middlewares:
 * - **persist**: Saves keybindings to localStorage for user customization
 * - **devtools**: Integrates with Redux DevTools for debugging
 *
 * @remarks
 * ## Persistence
 * Only the `keybindings` array is persisted to localStorage. The `isEnabled`
 * flag resets to true on each session to prevent accidental permanent disabling.
 *
 * ## Default Keybindings
 * The store initializes with vim-like defaults from `defaultKeybindings`.
 * Users can customize these, and changes are automatically saved.
 *
 * ## Matching Algorithm
 * The `findAction` method uses exact matching for all keys and modifiers.
 * This ensures predictable behavior but means that extra modifiers will
 * prevent matches (e.g., Ctrl+Shift+h won't match a binding for just 'h').
 *
 * @example
 * // Get current keybindings
 * const keybindings = useKeybindingStore((state) => state.keybindings);
 *
 * @example
 * // Find action for an event
 * const findAction = useKeybindingStore((state) => state.findAction);
 * const action = findAction(event);
 * if (action) {
 *   executeAction(action);
 * }
 *
 * @example
 * // Temporarily disable all keybindings
 * useKeybindingStore.setState({ isEnabled: false });
 */
export const useKeybindingStore = create<KeybindingState>()(
  devtools(
    persist(
      (_set, get) => ({
        keybindings: defaultKeybindings,
        isEnabled: true,

        findAction: event => {
          const { keybindings, isEnabled } = get();

          if (!isEnabled) return null;

          const binding = keybindings.find(kb => {
            const keyMatch = kb.key === event.key;
            const ctrlMatch = (kb.modifiers?.ctrl ?? false) === event.ctrlKey;
            const shiftMatch = (kb.modifiers?.shift ?? false) === event.shiftKey;

            return keyMatch && ctrlMatch && shiftMatch;
          });

          return binding?.action ?? null;
        },
      }),
      {
        name: 'keybindings-storage',
        partialize: state => ({ keybindings: state.keybindings }),
      }
    ),
    { name: 'KeybindingStore' }
  )
);
