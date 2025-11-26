/**
 * Tauri command wrappers for frontend-backend communication.
 *
 * This module provides a clean, type-safe API for invoking Tauri commands from
 * the frontend. Each command is wrapped in a properly typed async function that
 * handles the invoke call and returns the correct type.
 *
 * @module infrastructure/tauri/commands
 */

import { invoke } from '@tauri-apps/api/core';
import type { GraphData, AppConfig } from '../../shared/types';

/**
 * Collection of type-safe Tauri command wrappers.
 *
 * This object provides methods for all available Tauri commands, ensuring type
 * safety for both arguments and return values. Use these wrappers instead of
 * calling `invoke` directly to get better TypeScript support and autocomplete.
 *
 * @example
 * import { TauriCommands } from '@infrastructure/tauri/commands';
 *
 * // Scan a directory for markdown files
 * const graphData = await TauriCommands.scanFolder('/path/to/notes');
 *
 * // Get application configuration
 * const config = await TauriCommands.getConfig();
 *
 * // Open a file in nvim
 * await TauriCommands.openFile('/path/to/note.md');
 */
export const TauriCommands = {
  /**
   * Scans a directory for markdown files and builds a graph.
   *
   * Invokes the backend `scan_folder` command which performs a complete scan of
   * the specified directory, parses all markdown files, and constructs a graph
   * of wiki-link connections.
   *
   * @param path - File system path to the directory containing markdown files
   * @returns Promise resolving to complete graph data with all nodes and edges
   *
   * @throws Error if the directory doesn't exist, isn't accessible, or file reading fails
   *
   * @remarks
   * This operation is blocking on the backend and can take several seconds for
   * large note collections. The UI should show a loading indicator while this
   * command executes.
   *
   * @example
   * try {
   *   const graphData = await TauriCommands.scanFolder('/home/user/notes');
   *   console.log(`Loaded ${graphData.nodes.length} nodes`);
   * } catch (error) {
   *   console.error('Failed to scan folder:', error);
   * }
   */
  async scanFolder(path: string): Promise<GraphData> {
    return await invoke<GraphData>('scan_folder', { path });
  },

  /**
   * Retrieves the current application configuration.
   *
   * Invokes the backend `get_config` command which returns a snapshot of the
   * current configuration state, including the root directory and other settings.
   *
   * @returns Promise resolving to the current application configuration
   *
   * @remarks
   * The configuration is loaded from CLI arguments and config files during
   * application startup. This command returns a snapshot and does not reload
   * configuration from disk.
   *
   * @example
   * const config = await TauriCommands.getConfig();
   * if (config.root_dir) {
   *   console.log('Root directory:', config.root_dir);
   * } else {
   *   console.log('No root directory configured');
   * }
   */
  async getConfig(): Promise<AppConfig> {
    return await invoke<AppConfig>('get_config');
  },

  /**
   * Opens a markdown file by node ID in the nvim editor.
   *
   * Invokes the backend `open_file` command which resolves the node ID to a file
   * path and launches an external nvim process. If the file doesn't exist and a
   * phantom node template is configured, the file is automatically created from
   * the template before opening.
   *
   * @param nodeId - The ID/name of the node (without .md extension)
   * @returns Promise that resolves when the file is opened (or created and opened)
   *
   * @throws Error if root_dir is not configured, nvim is not found, or creation fails
   *
   * @remarks
   * The backend constructs the file path as: `{root_dir}/{nodeId}.md`
   *
   * Phantom node behavior:
   * - If the file exists: Opens it directly in nvim
   * - If the file doesn't exist and template is configured: Creates from template, then opens
   * - If the file doesn't exist and no template: Returns error
   *
   * The spawned nvim process runs independently of the application. This function
   * returns immediately after spawning without waiting for nvim to close.
   *
   * Platform-specific behavior:
   * - Windows: Uses `cmd /C start nvim <file>` to launch in a new window
   * - Unix/Linux/macOS: Directly spawns `nvim <file>` as a child process
   *
   * @example
   * // Open existing node
   * await TauriCommands.openFile('JavaScript');
   *
   * // Open phantom node (will be created if template configured)
   * await TauriCommands.openFile('New Idea');
   */
  async openFile(nodeId: string): Promise<void> {
    return await invoke<void>('open_file', { nodeId });
  },

  /**
   * Reads the markdown content of a note by node ID.
   *
   * Invokes the backend `read_note` command which reads the file content
   * for displaying in the preview popup.
   *
   * @param nodeId - The ID/name of the node (without .md extension)
   * @returns Promise resolving to the markdown content string
   *
   * @throws Error if root_dir is not configured, file doesn't exist (phantom node),
   *         or reading fails
   *
   * @example
   * const content = await TauriCommands.readNote('JavaScript');
   */
  async readNote(nodeId: string): Promise<string> {
    return await invoke<string>('read_note', { nodeId });
  },
};
