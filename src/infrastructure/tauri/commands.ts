import { invoke } from '@tauri-apps/api/core';
import type { GraphData, AppConfig } from '../../shared/types';

const COMMANDS = {
  SCAN_FOLDER: 'scan_folder',
  GET_CONFIG: 'get_config',
  OPEN_FILE: 'open_file',
  READ_NOTE: 'read_note',
} as const;

export const TauriCommands = {

  async scanFolder(path: string): Promise<GraphData> {
    return invoke<GraphData>(COMMANDS.SCAN_FOLDER, { path });
  },

  async getConfig(): Promise<AppConfig> {
    return invoke<AppConfig>(COMMANDS.GET_CONFIG);
  },

  async openFile(nodeId: string): Promise<void> {
    return invoke<void>(COMMANDS.OPEN_FILE, { nodeId });
  },

  async readNote(nodeId: string): Promise<string> {
    return invoke<string>(COMMANDS.READ_NOTE, { nodeId });
  },
};
