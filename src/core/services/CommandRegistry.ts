import type { ICommandRegistry, CommandMetadata, CommandHandler, CommandContext, IEventBus } from '../interfaces';
import type { ServiceContainer } from '../di/types';

interface RegisteredCommand {
  metadata: CommandMetadata;
  handler: CommandHandler;
}

export class CommandRegistry implements ICommandRegistry {
  private commands = new Map<string, RegisteredCommand>();
  private serviceContainer: ServiceContainer | null = null;

  constructor(private eventBus: IEventBus) {}

  setServiceContainer(container: ServiceContainer): void {
    this.serviceContainer = container;
  }

  register(metadata: CommandMetadata, handler: CommandHandler): void {
    if (this.commands.has(metadata.id)) {
      console.warn(`Command "${metadata.id}" is already registered. Overwriting.`);
    }

    this.commands.set(metadata.id, { metadata, handler });
    this.eventBus.emit('command:registered', { commandId: metadata.id });
  }

  unregister(commandId: string): void {
    if (this.commands.delete(commandId)) {
      this.eventBus.emit('command:unregistered', { commandId });
    }
  }

  async execute(commandId: string, args?: Record<string, unknown>): Promise<void> {
    const command = this.commands.get(commandId);

    if (!command) {
      console.warn(`Command "${commandId}" not found.`);
      return;
    }

    if (!this.serviceContainer) {
      throw new Error('ServiceContainer not set. Call setServiceContainer first.');
    }

    const context: CommandContext = {
      services: this.serviceContainer,
      args,
    };

    this.eventBus.emit('command:beforeExecute', { commandId, args });

    try {
      await command.handler(context);
      this.eventBus.emit('command:afterExecute', { commandId, success: true });
    } catch (error) {
      this.eventBus.emit('command:afterExecute', { commandId, success: false, error });
      throw error;
    }
  }

  has(commandId: string): boolean {
    return this.commands.has(commandId);
  }

  getMetadata(commandId: string): CommandMetadata | null {
    return this.commands.get(commandId)?.metadata ?? null;
  }

  getAllCommands(): CommandMetadata[] {
    return Array.from(this.commands.values()).map((cmd) => cmd.metadata);
  }
}
