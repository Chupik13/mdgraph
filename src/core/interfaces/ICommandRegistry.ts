import type { ServiceContainer } from '../di/types';

export interface CommandMetadata {
  id: string;
  description: string;
  category: string;
}

export interface CommandContext {
  services: ServiceContainer;
  args?: Record<string, unknown>;
}

export type CommandHandler = (context: CommandContext) => void | Promise<void>;

export interface ICommandRegistry {

  register(metadata: CommandMetadata, handler: CommandHandler): void;

  unregister(commandId: string): void;

  execute(commandId: string, args?: Record<string, unknown>): Promise<void>;

  has(commandId: string): boolean;

  getMetadata(commandId: string): CommandMetadata | null;

  getAllCommands(): CommandMetadata[];
}
