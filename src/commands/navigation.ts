import type { ICommandRegistry } from '../core/interfaces';

export function registerNavigationCommands(registry: ICommandRegistry): void {
  registry.register(
    { id: 'navigation.up', description: 'Navigate to node above', category: 'navigation' },
    (ctx) => ctx.services.navigator.toUp()
  );

  registry.register(
    { id: 'navigation.down', description: 'Navigate to node below', category: 'navigation' },
    (ctx) => ctx.services.navigator.toDown()
  );

  registry.register(
    { id: 'navigation.left', description: 'Navigate to node on the left', category: 'navigation' },
    (ctx) => ctx.services.navigator.toLeft()
  );

  registry.register(
    { id: 'navigation.right', description: 'Navigate to node on the right', category: 'navigation' },
    (ctx) => ctx.services.navigator.toRight()
  );

  registry.register(
    { id: 'navigation.clockwiseConnected', description: 'Navigate to next connected node (clockwise)', category: 'navigation' },
    (ctx) => ctx.services.navigator.toClockwiseConnected()
  );

  registry.register(
    { id: 'navigation.counterClockwiseConnected', description: 'Navigate to previous connected node', category: 'navigation' },
    (ctx) => ctx.services.navigator.toCounterClockwiseConnected()
  );

  registry.register(
    { id: 'navigation.clockwiseActive', description: 'Navigate to next active node (clockwise)', category: 'navigation' },
    (ctx) => ctx.services.navigator.toClockwiseActive()
  );

  registry.register(
    { id: 'navigation.counterClockwiseActive', description: 'Navigate to previous active node', category: 'navigation' },
    (ctx) => ctx.services.navigator.toCounterClockwiseActive()
  );
}
