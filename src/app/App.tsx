import React, { useEffect } from 'react';
import { GraphCanvas } from '../features/graph/components/GraphCanvas';
import { CommandLine } from '../features/command-line/components/CommandLine';
import { useKeybindings } from '../features/keybindings/hooks/useKeybindings';
import { useGraphSync } from '../infrastructure/services/GraphSyncService';
import { TauriCommands } from '../infrastructure/tauri/commands';
import { useGraphStore } from '../features/graph/store/graphStore';

export const App: React.FC = () => {
  const setGraphData = useGraphStore((state) => state.setGraphData);
  const setLoading = useGraphStore((state) => state.setLoading);
  const setError = useGraphStore((state) => state.setError);

  useKeybindings();
  useGraphSync();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);

        const config = await TauriCommands.getConfig();

        if (config.root_dir) {
          const graphData = await TauriCommands.scanFolder(config.root_dir);
          setGraphData(graphData);
        } else {
          setLoading(false);
          console.warn('[App] No root_dir configured');
        }
      } catch (error) {
        console.error('[App] Failed to initialize:', error);
        setError(error instanceof Error ? error.message : 'Failed to initialize application');
      }
    };

    initializeApp();
  }, [setGraphData, setLoading, setError]);

  return (
    <div className="flex flex-col h-screen bg-gray-900/50">

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 relative">
          <GraphCanvas />
        </main>
      </div>

      <CommandLine />
    </div>
  );
};
