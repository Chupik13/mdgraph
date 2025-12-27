import type { ICommandRegistry } from '../core/interfaces';
import { registerNavigationCommands } from './navigation';
import { registerGraphCommands } from './graph';

export function registerAllCommands(registry: ICommandRegistry): void {
  registerNavigationCommands(registry);
  registerGraphCommands(registry);
}

export { registerNavigationCommands } from './navigation';
export { registerGraphCommands } from './graph';
