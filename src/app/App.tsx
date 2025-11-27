import React, { useEffect } from 'react';
import { GraphCanvas } from '../features/graph/components/GraphCanvas';
import { CommandLine } from '../features/command-line/components/CommandLine';
import { PreviewPopup } from '../features/preview';
import { useKeybindings } from '../features/keybindings/hooks/useKeybindings';
import { useGraphSync } from '../infrastructure/services/GraphSyncService';
import { TauriCommands } from '../infrastructure/tauri/commands';
import { graphDataService } from '../features/graph/services/GraphDataService';

export const App: React.FC = () => {
  useKeybindings();
  useGraphSync();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        graphDataService.setStatus('loading');

        const config = await TauriCommands.getConfig();

        if (config.root_dir) {
          const graphData = await TauriCommands.scanFolder(config.root_dir);
          graphDataService.setInitialData(graphData);
        } else {
          graphDataService.setStatus('idle');
          console.warn('[App] No root_dir configured');
        }
      } catch (error) {
        console.error('[App] Failed to initialize:', error);
        graphDataService.setStatus(
          'error',
          error instanceof Error ? error.message : 'Failed to initialize application'
        );
      }
    };

    initializeApp();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-900/50">
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 relative">
          <GraphCanvas />
        </main>
      </div>

      <CommandLine />
      <PreviewPopup />
    </div>
  );
};
