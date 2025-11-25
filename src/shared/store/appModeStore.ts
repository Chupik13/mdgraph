/**
 * Application mode state management.
 *
 * This module provides a Zustand store for managing global application modes,
 * similar to Vim's modal editing system. Different modes enable different
 * keyboard shortcuts and interaction patterns.
 *
 * @module shared/store/appModeStore
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * Global application modes.
 *
 * The application operates in different modes that affect keyboard input handling
 * and available commands, inspired by Vim's modal interface design.
 *
 * @property normal - Default navigation mode. Enables graph navigation with vim-like
 *                    keybindings (hjkl, w/b, etc.). Most commands are available in
 *                    this mode.
 * @property search - Search mode. Activated by pressing '/' in normal mode. Text input
 *                    is captured for searching nodes rather than being interpreted as
 *                    navigation commands.
 */
export type AppMode = 'normal' | 'search';

/**
 * Application mode store state interface.
 *
 * Defines the shape of the mode store, including the current mode and actions
 * for changing modes.
 */
interface AppModeState {
  /**
   * The currently active application mode.
   */
  currentMode: AppMode;

  /**
   * Changes the application mode.
   *
   * Updates the current mode if it differs from the requested mode. If the
   * requested mode is already active, no state change occurs (prevents
   * unnecessary re-renders).
   *
   * @param mode - The mode to activate ('normal' or 'search')
   *
   * @remarks
   * Mode transitions typically occur when:
   * - User presses '/' to enter search mode
   * - User presses Escape to return to normal mode
   * - User completes a search operation
   *
   * @example
   * const setMode = useAppModeStore((state) => state.setMode);
   *
   * // Enter search mode
   * setMode('search');
   *
   * // Return to normal mode
   * setMode('normal');
   */
  setMode: (mode: AppMode) => void;
}

/**
 * Zustand store for managing application modes.
 *
 * This store manages the global modal state of the application, controlling
 * which keyboard shortcuts are active and how user input is interpreted.
 *
 * @remarks
 * - Initial mode is 'normal'
 * - Redux DevTools integration is enabled for debugging mode transitions
 * - Store is automatically typed with TypeScript for type safety
 *
 * @example
 * // Get current mode
 * const currentMode = useAppModeStore((state) => state.currentMode);
 *
 * @example
 * // Change mode
 * const setMode = useAppModeStore((state) => state.setMode);
 * setMode('search');
 *
 * @example
 * // Conditional rendering based on mode
 * function ModeIndicator() {
 *   const mode = useAppModeStore((state) => state.currentMode);
 *   return <div>Current mode: {mode}</div>;
 * }
 */
export const useAppModeStore = create<AppModeState>()(
  devtools(
    (set, get) => ({
      currentMode: 'normal',

      setMode: (mode) => {
        const { currentMode } = get();

        if (currentMode === mode) {
            return;
        }

        set({
          currentMode: mode,
        });
      },
    }),

    { name: 'AppModeStore' },
  ),
);
