/**
 * Type definitions for Tauri command interface.
 *
 * This module provides strongly-typed interfaces for invoking Tauri commands from
 * the frontend. It ensures type safety for both command arguments and return values,
 * preventing runtime errors from mismatched types.
 *
 * @module shared/types/tauri
 */

import type { GraphData, AppConfig } from './domain';

/**
 * Map of Tauri command names to their argument types.
 *
 * This interface defines the expected argument structure for each Tauri command.
 * The keys are command names as strings, and the values are the argument types
 * that must be passed when invoking that command.
 *
 * @property scan_folder - Requires a path string to the directory to scan
 * @property get_config - No arguments required (void)
 * @property open_file - Requires a filePath string to the file to open
 */
export interface TauriInvokeArgs {
  scan_folder: { path: string };
  get_config: void;
  open_file: { filePath: string };
  read_note: { nodeId: string };
}

/**
 * Map of Tauri command names to their return types.
 *
 * This interface defines the return type for each Tauri command. When a command
 * is invoked, the Promise will resolve to the corresponding type defined here.
 *
 * @property scan_folder - Returns complete graph data with nodes and edges
 * @property get_config - Returns application configuration
 * @property open_file - Returns void (no return value)
 */
export interface TauriInvokeReturns {
  scan_folder: GraphData;
  get_config: AppConfig;
  open_file: void;
  read_note: string;
}

/**
 * Union type of all available Tauri commands.
 *
 * This type extracts the command names from TauriInvokeArgs as a union of string literals,
 * providing autocomplete and type checking for command names.
 */
export type TauriCommand = keyof TauriInvokeArgs;

/**
 * Global window augmentation for Tauri API.
 *
 * Extends the global Window interface to include type-safe Tauri invoke method.
 * This declaration provides TypeScript type checking for the Tauri runtime API
 * available in the browser context.
 *
 * @remarks
 * This is a legacy type definition for the older Tauri API format. The newer
 * `@tauri-apps/api/core` import is preferred, but this declaration maintains
 * compatibility with any code using the window.__TAURI__ API.
 */
declare global {
  interface Window {
    __TAURI__: {
      /**
       * Invokes a Tauri command with type-safe arguments and return values.
       *
       * @template T - The command name, constrained to valid TauriCommand types
       * @param cmd - The name of the command to invoke
       * @param args - Arguments for the command, typed based on the command name
       * @returns Promise that resolves to the command's return type
       *
       * @example
       * // Type-safe command invocation
       * const graphData = await window.__TAURI__.invoke('scan_folder', {
       *   path: '/path/to/notes'
       * });
       */
      invoke<T extends TauriCommand>(
        cmd: T,
        args: TauriInvokeArgs[T],
      ): Promise<TauriInvokeReturns[T]>;
    };
  }
}
