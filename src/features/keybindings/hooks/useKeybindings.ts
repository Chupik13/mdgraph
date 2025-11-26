/**
 * Global keyboard shortcut handler hook.
 *
 * This hook sets up a global keyboard event listener that translates key presses
 * into application actions using the keybinding store. It coordinates between
 * multiple features (navigation, coloring, camera, command line) to execute the
 * appropriate action for each keyboard shortcut.
 *
 * @module features/keybindings/hooks/useKeybindings
 */

import { useEffect, useCallback } from 'react';
import { useKeybindingStore } from '../store/keybindingStore';
import { graphDataService } from '../../graph/services/GraphDataService';
import { useColoringStore } from '../../coloring';
import { useCommandLineStore } from '../../command-line/store/commandLineStore';
import { useAppModeStore } from '../../../shared/store/appModeStore';
import { useVimNavigation, useConnectedNavigation, useSearchNavigation } from '../../navigation';
import { CameraService } from '../../camera';
import { TauriCommands } from '../../../infrastructure/tauri/commands';
import { usePreviewStore } from '../../preview';
import type { KeybindingAction } from '../store/keybindingStore';

/**
 * Hook that sets up global keyboard shortcut handling.
 *
 * This hook should be called once at the application root level (e.g., in App.tsx).
 * It establishes a global keydown listener that:
 * 1. Ignores events from input/textarea elements
 * 2. Looks up the action for the key combination
 * 3. Prevents default browser behavior
 * 4. Executes the corresponding application action
 *
 * @returns void - This hook has no return value and only manages side effects
 *
 * @remarks
 * ## Action Execution
 * The hook delegates to specialized navigation hooks and services:
 * - **Vim Navigation**: Uses `useVimNavigation` for hjkl directional movement
 * - **Connected Navigation**: Uses `useConnectedNavigation` for w/b node hopping
 * - **Camera Operations**: Uses `CameraService` for zoom/fit operations
 * - **File Operations**: Uses `TauriCommands` to open files in nvim
 * - **Mode Switching**: Updates `appModeStore` for command/search modes
 *
 * ## Escape Key Behavior
 * The Escape key has complex context-dependent behavior:
 * 1. If command line is open: Close it (handled by command line component)
 * 2. If in search mode with no selection: Exit search mode
 * 3. If focused node != selected node: Focus selected node and fit viewport
 * 4. If focused node == selected node: Deselect node
 * 5. If no selection: Reset zoom and clear focus
 *
 * ## Input Element Handling
 * Keyboard shortcuts are automatically disabled when focus is in:
 * - `<input>` elements
 * - `<textarea>` elements
 *
 * This allows normal text entry without interference from shortcuts.
 *
 * ## Performance
 * The hook uses `useCallback` and `useMemo` to minimize re-renders:
 * - `executeAction` is memoized with stable dependencies
 * - `handleKeyPress` is memoized to maintain stable event listener reference
 * - `cameraService` is only created when network instance changes
 *
 * @example
 * // In App.tsx or root component
 * function App() {
 *   useKeybindings(); // Sets up global keyboard handling
 *
 *   return <GraphCanvas />;
 * }
 *
 * @example
 * // Keyboard shortcuts work automatically:
 * // - Press 'h' to navigate left
 * // - Press 'w' to focus next connected node
 * // - Press 'o' to open selected node in editor
 * // - Press '/' to enter search mode
 * // - Press 'Escape' to cancel/exit
 */
export const useKeybindings = () => {
  const findAction = useKeybindingStore(state => state.findAction);
  const setMode = useAppModeStore(state => state.setMode);

  const { navigateLeft, navigateRight, navigateUp, navigateDown } = useVimNavigation();
  const { navigateNextConnected, navigatePrevConnected } = useConnectedNavigation();
  const { navigateNextSearchResult, navigatePrevSearchResult } = useSearchNavigation();

  const selectNode = useColoringStore(state => state.selectNode);
  const focusNode = useColoringStore(state => state.focusNode);

  const openCommandLine = useCommandLineStore(state => state.open);

  const openPreview = usePreviewStore((state) => state.open);
  const setPreviewLoading = usePreviewStore((state) => state.setLoading);
  const setPreviewError = usePreviewStore((state) => state.setError);

  /**
   * Executes an action based on its type.
   *
   * Central dispatcher that routes each action to the appropriate handler.
   * Actions are organized into categories (graph, viewport, app) and each
   * case delegates to the relevant service or hook.
   *
   * @param action - The keybinding action to execute
   *
   * @remarks
   * Most actions are straightforward delegations, but some have complex logic:
   * - `graph.openNode`: Finds the selected node and opens its file path
   * - `app.escape`: Has multi-level fallback behavior based on context
   * - `graph.selectFocusedNode`: Selects the currently focused node if one exists
   *
   * The function is async to support actions that need to await Tauri commands.
   */
  const executeAction = useCallback(
    async (action: KeybindingAction) => {
      console.log('Executing action:', action);
      switch (action) {
        case 'graph.selectLeft':
          navigateLeft();
          break;
        case 'graph.selectRight':
          navigateRight();
          break;
        case 'graph.selectUp':
          navigateUp();
          break;
        case 'graph.selectDown':
          navigateDown();
          break;

        case 'graph.focusNextConnected':
          navigateNextConnected();
          break;

        case 'graph.focusPrevConnected':
          navigatePrevConnected();
          break;

        case 'search.nextResult':
          navigateNextSearchResult();
          break;

        case 'search.prevResult':
          navigatePrevSearchResult();
          break;

        case 'graph.selectFocusedNode': {
          const { focusedNodeId } = useColoringStore.getState();
          if (focusedNodeId) {
            selectNode(focusedNodeId);
          }
          break;
        }

        case 'graph.openNode': {
          const { focusedNodeId } = useColoringStore.getState();
          if (focusedNodeId && graphDataService.isReady()) {
            // Use GraphDataService as single source of truth
            const node = graphDataService.getNode(focusedNodeId);
            try {
              if (node && node.id) {
                await TauriCommands.openFile(node.id);
              }
            } catch (error) {
              console.error('Failed to open file:', error);
            }
          }
          break;
        }

        case 'graph.previewNode': {
          const { focusedNodeId } = useColoringStore.getState();
          const { graphData, networkInstance } = useGraphStore.getState();

          if (focusedNodeId && graphData && networkInstance) {
            const node = graphData.nodes.find((n) => n.id === focusedNodeId);
            // Ignore phantom nodes
            if (node && node.group !== 'phantom') {
              try {
                setPreviewLoading(true);

                // Get node position in canvas coordinates
                const positions = networkInstance.getPositions([focusedNodeId]);
                const canvasPos = positions[focusedNodeId];

                if (!canvasPos) {
                  throw new Error('Failed to get node position');
                }

                // Convert to DOM coordinates
                const domPos = networkInstance.canvasToDOM({
                  x: canvasPos.x,
                  y: canvasPos.y,
                });

                // Add offset below the node (30px down)
                const position = {
                  x: domPos.x,
                  y: domPos.y + node.value * 1.15 + 50,
                };

                const content = await TauriCommands.readNote(focusedNodeId);
                openPreview(focusedNodeId, content, position);
              } catch (error) {
                console.error('Failed to load preview:', error);
                setPreviewError(
                  error instanceof Error ? error.message : 'Failed to load preview',
                );
              }
            }
          }
          break;
        }

        case 'app.openCommandMode':
          openCommandLine();
          break;

        case 'app.openSearchMode':
          setMode('search');
          openCommandLine();
          break;

        case 'app.escape': {
          const { isOpen: isPreviewOpen } = usePreviewStore.getState();
          const { selectedNodeId, focusedNodeId } = useColoringStore.getState();
          const { isOpen: isCommandLineOpen } = useCommandLineStore.getState();
          const { currentMode } = useAppModeStore.getState();

          // Priority 1: Close preview popup
          if (isPreviewOpen) {
            usePreviewStore.getState().close();
            break;
          }

          // Priority 2: Command line (handled by its own component)
          if (isCommandLineOpen) {
            break;
          }

          if (currentMode === 'search') {
            if (!selectedNodeId && !focusedNodeId) {
              setMode('normal');
              useColoringStore.getState().setActiveNodes(null);
              break;
            }
          }

          // Get network dynamically inside the action
          const network = graphDataService.getNetwork();

          if(network){
              const cameraService = new CameraService(network);
              if (selectedNodeId && focusedNodeId !== selectedNodeId) {
                  focusNode(selectedNodeId);
                  const { incomingNodeIds, outgoingNodeIds } = useColoringStore.getState();
                  const nodesToFit = [
                      selectedNodeId,
                      ...Array.from(incomingNodeIds),
                      ...Array.from(outgoingNodeIds),
                  ];
                  cameraService.fitAll(nodesToFit);
              } else if (selectedNodeId && focusedNodeId === selectedNodeId) {
                  selectNode(null);
              } else if (!selectedNodeId) {
                  if (cameraService) {
                      const { activeNodeIds } = useColoringStore.getState();
                      const nodeIds = activeNodeIds ? Array.from(activeNodeIds) : [];
                      cameraService.fitAll(nodeIds);
                      focusNode(null);
                  }
              }
          }
          break;
        }

        default:
            console.warn(`Unknown action: ${action}`);
      }
    },
    [
        navigateLeft,
      navigateRight,
      navigateUp,
      navigateDown,
      navigateNextConnected,
      navigatePrevConnected,
      navigateNextSearchResult,
      navigatePrevSearchResult,
      selectNode,
      focusNode,
      setMode,
      openCommandLine,
      graphData,
      openPreview,
      setPreviewLoading,
      setPreviewError,
    ],
  );

  /**
   * Handles keydown events from the browser.
   *
   * This is the main event handler attached to the window. It filters out
   * events from input elements, finds the matching action, prevents default
   * browser behavior, and executes the action.
   *
   * @param event - Browser keyboard event
   *
   * @remarks
   * The handler performs these steps:
   * 1. Check if target is input/textarea (if so, ignore)
   * 2. Look up action from keybinding store
   * 3. If no action found, allow default browser behavior
   * 4. Prevent default (stop browser from processing the key)
   * 5. Execute the action
   */
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // When preview is open, keybindings are handled by PreviewPopup
      const { isOpen: isPreviewOpen } = usePreviewStore.getState();
      if (isPreviewOpen) {
        return;
      }

      const action = findAction(event);
      if (!action) return;

      event.preventDefault();

      executeAction(action);
    },
    [findAction, executeAction]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);
};
