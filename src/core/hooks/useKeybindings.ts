import { useEffect } from 'react';
import { useService } from '../di';

export function useKeybindings(): void {
  const keybindingService = useService('keybindingService');

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      keybindingService.handleKeyDown(event);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [keybindingService]);
}
