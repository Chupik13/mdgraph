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

export interface ServiceContainer {
  nodeRepository: INodeRepository;
  eventBus: IEventBus;
  graphState: IGraphStateService;
  colorist: IColorist;
  cameraMan: ICameraMan;
  navigator: INavigator;
  commandRegistry: ICommandRegistry;
  keybindingService: IKeybindingService;
}

export type ServiceName = keyof ServiceContainer;
