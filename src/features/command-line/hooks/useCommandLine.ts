import { useEffect, useCallback } from 'react';
import type { RefObject } from 'react';
import { useCommandLineStore } from '../store/commandLineStore';
import { useAppModeStore } from '../../../shared/store/appModeStore';
import { useColoringStore } from '../../coloring';

export const useCommandLine = (_inputRef: RefObject<HTMLInputElement>) => {
  const isOpen = useCommandLineStore((state) => state.isOpen);
  const close = useCommandLineStore((state) => state.close);
  const input = useCommandLineStore((state) => state.input);
  const currentMode = useAppModeStore((state) => state.currentMode);
  const setActiveNodes = useColoringStore((state) => state.setActiveNodes);
  const selectedNodeId = useColoringStore((state) => state.selectedNodeId);
  const focusedNodeId = useColoringStore((state) => state.focusedNodeId);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen) {
          return; 
      }

      switch (event.key) {
        case 'Escape':
          event.preventDefault();

          close();
          break;

        case 'Enter':
          event.preventDefault();

          if (currentMode === 'search') {
            close();
          } else {
            // TODO: Command processing will be here
            close();
          }
          break;

        default:
          break;
      }
    },
    [isOpen, close, input, currentMode, selectedNodeId, focusedNodeId, setActiveNodes],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};
