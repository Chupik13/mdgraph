import type { ServiceContainer } from './types';
import type {
  INodeRepository,
  IEventBus,
  IGraphStateService,
  IColorist,
  ICameraMan,
  INavigator,
  ICommandRegistry,
  IKeybindingService,
} from '../interfaces';
import {
  NodeRepository,
  EventBus,
  GraphStateService,
  Colorist,
  CameraMan,
  Navigator,
  CommandRegistry,
  KeybindingService,
} from '../services';

export interface ContainerConfig {
  nodeRepository?: INodeRepository;
  eventBus?: IEventBus;
  graphState?: IGraphStateService;
  colorist?: IColorist;
  cameraMan?: ICameraMan;
  navigator?: INavigator;
  commandRegistry?: ICommandRegistry;
  keybindingService?: IKeybindingService;
}

export function createContainer(config: ContainerConfig = {}): ServiceContainer {
  const eventBus: IEventBus = config.eventBus ?? new EventBus();
  const nodeRepository: INodeRepository = config.nodeRepository ?? new NodeRepository(eventBus);
  const graphState: IGraphStateService = config.graphState ?? new GraphStateService(eventBus, nodeRepository);
  const colorist: IColorist = config.colorist ?? new Colorist(eventBus, graphState);
  const cameraMan: ICameraMan = config.cameraMan ?? new CameraMan(eventBus);
  const navigator: INavigator = config.navigator ?? new Navigator(graphState, nodeRepository);

  // Command system - requires special setup for circular reference
  const commandRegistry = config.commandRegistry ?? new CommandRegistry(eventBus);
  const keybindingService: IKeybindingService =
    config.keybindingService ?? new KeybindingService(commandRegistry);

  const container: ServiceContainer = {
    nodeRepository,
    eventBus,
    graphState,
    colorist,
    cameraMan,
    navigator,
    commandRegistry,
    keybindingService,
  };

  // Wire up circular dependency: CommandRegistry needs container for execution context
  if (commandRegistry instanceof CommandRegistry) {
    commandRegistry.setServiceContainer(container);
  }

  return container;
}
