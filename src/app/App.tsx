/**
 * Root application component.
 * Sets up the main application layout and initializes services.
 */

import { useEffect, useState, useRef } from 'react';
import { useService } from '../core/di';
import { useKeybindings } from '../core/hooks';
import type { AppConfig, GraphData } from '../shared/types';
import { TauriCommands } from '../infrastructure/tauri';
import { registerAllCommands } from '../commands';
import { DEFAULT_KEYBINDING_CONFIG } from '../shared/config/defaultKeybindings';
import { GraphCanvas } from './components';

/**
 * Main application content.
 * Rendered inside ServiceProvider, has access to all services.
 */
function AppContent() {
  const commandRegistry = useService('commandRegistry');
  const keybindingService = useService('keybindingService');

  const [config, setConfig] = useState<AppConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<GraphData>();

  // Track if commands have been registered to avoid double registration
  const commandsRegistered = useRef(false);

  // Initialize keybindings hook
  useKeybindings();

  // Register commands and initialize keybindings (once)
  useEffect(() => {
    if (!commandsRegistered.current) {
      registerAllCommands(commandRegistry);
      keybindingService.initialize(DEFAULT_KEYBINDING_CONFIG);
      commandsRegistered.current = true;
      console.log('[App] Commands registered and keybindings initialized');
    }
  }, [commandRegistry, keybindingService]);

  useEffect(() => {
    console.log("useEffect: Loading config...");
    const initializeApp = async () => {
      try {
        setIsLoading(true);

        const config = await TauriCommands.getConfig();
        setConfig(config);
        console.log("Config loaded:", config);

        if (config.root_dir) {
          console.log("[App] start scanFolder..");
          const graphData = await TauriCommands.scanFolder(config.root_dir);
          setGraphData(graphData);
          setIsLoading(false);
        } else {
          setIsLoading(false);
          console.warn('[App] No root_dir configured');
        }
      } catch (error) {
        console.error('[App] Failed to initialize:', error);
        setError(error instanceof Error ? error.message : 'Failed to initialize application');
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-900/50 text-neutral-100">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-900/50 text-red-400">
        <div className="text-lg">Error: {error}</div>
      </div>
    );
  }

  if (!config?.root_dir) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-900/50 text-neutral-400">
        <div className="text-center">
          <div className="text-lg">No root directory configured</div>
          <div className="mt-2 text-sm">
            Please configure root_dir in config.json or via CLI arguments.
          </div>
        </div>
      </div>
    );
  }

  // TODO: Render main application layout
  // This will include:
  // - GraphCanvas component
  // - CommandLine component
  // - Search overlay
  // - Preview popup

  return (
    <div className="flex flex-col h-screen bg-gray-900/50">
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 relative">
          <GraphCanvas graphData={graphData}/>
        </main>
      </div>

      {/* TODO: Add CommandLine here */}
      {/* TODO: Add PreviewPopup here */}
    </div>
  );
}

/**
 * Root App component.
 * Note: ServiceProvider is applied in main.tsx
 */
export function App() {
  return <AppContent />;
}
