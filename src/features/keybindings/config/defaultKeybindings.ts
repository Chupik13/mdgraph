/**
 * Default keybinding configuration for the application.
 *
 * This module defines the default keyboard shortcuts inspired by Vim's modal
 * editing paradigm. All keybindings can be customized by users and are persisted
 * to localStorage via the keybinding store.
 *
 * @module features/keybindings/config/defaultKeybindings
 */

import type { Keybinding } from '../store/keybindingStore';

/**
 * Default keybinding configuration array.
 *
 * Provides vim-like keyboard navigation and commands for the graph interface.
 * The keybindings are organized into categories:
 *
 * ## Vim-Style Navigation (hjkl)
 * - `h` - Navigate left
 * - `j` - Navigate down
 * - `k` - Navigate up
 * - `l` - Navigate right
 * - `Space` - Select the currently focused node
 *
 * ## Connected Node Navigation
 * - `w` - Focus next connected node (clockwise)
 * - `b` - Focus previous connected node (counterclockwise)
 *
 * ## File Operations
 * - `o` - Open currently selected node in nvim editor
 *
 * ## Command Mode
 * - `:` (Shift+;) - Open command line (vim-style command mode)
 * - `/` - Open search mode
 * - `Escape` - Exit/cancel current operation
 *
 * @remarks
 * All keybindings respect the current application mode:
 * - In 'normal' mode: All shortcuts are active
 * - In 'search' mode: Only Escape is active to exit search
 * - In command-line: Keybindings are handled by the command line component
 *
 * Keybindings are disabled when focus is in input/textarea elements to allow
 * normal text entry.
 *
 * @example
 * // Import and use in store
 * import { defaultKeybindings } from '../config/defaultKeybindings';
 * const store = create(() => ({ keybindings: defaultKeybindings }));
 *
 * @example
 * // Add custom keybinding
 * const customBindings: Keybinding[] = [
 *   ...defaultKeybindings,
 *   {
 *     key: 'g',
 *     modifiers: { ctrl: true },
 *     action: 'viewport.fitAll',
 *     description: 'Fit all nodes in viewport',
 *   },
 * ];
 */
export const defaultKeybindings: Keybinding[] = [
  {
    key: 'h',
    action: 'graph.selectLeft',
    description: 'Select node to the left',
  },
  {
    key: 'j',
    action: 'graph.selectDown',
    description: 'Select node below',
  },
  {
    key: 'k',
    action: 'graph.selectUp',
    description: 'Select node above',
  },
  {
    key: 'l',
    action: 'graph.selectRight',
    description: 'Select node to the right',
  },
  {
    key: ' ',
    action: 'graph.selectFocusedNode',
    description: 'Select focused node',
  },
  {
    key: 'w',
    action: 'graph.focusNextConnected',
    description: 'Focus on next connected node (clockwise)',
  },
  {
    key: 'b',
    action: 'graph.focusPrevConnected',
    description: 'Focus on previous connected node (counterclockwise)',
  },
  {
    key: 'o',
    action: 'graph.openNode',
    description: 'Open node in editor',
  },
  {
    key: ':',
    modifiers: { shift: true },
    action: 'app.openCommandMode',
    description: 'Open command line',
  },
  {
    key: '/',
   action: 'app.openSearchMode',
    description: 'Open search',
  },
  {
    key: 'Escape',
    action: 'app.escape',
    description: 'Exit / cancel',
  },
];
