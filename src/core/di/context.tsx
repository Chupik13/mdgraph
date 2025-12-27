import { createContext, useContext, type ReactNode } from 'react';
import type { ServiceContainer, ServiceName } from './types';

const ServiceContext = createContext<ServiceContainer | null>(null);

interface ServiceProviderProps {
  container: ServiceContainer;
  children: ReactNode;
}

export function ServiceProvider({ container, children }: ServiceProviderProps) {
  return (
    <ServiceContext.Provider value={container}>
      {children}
    </ServiceContext.Provider>
  );
}

export function useService<K extends ServiceName>(serviceName: K): ServiceContainer[K] {
  const container = useContext(ServiceContext);

  if (!container) {
    throw new Error(
      `useService('${serviceName}') must be used within a ServiceProvider. ` +
      'Make sure your component is wrapped in <ServiceProvider>.'
    );
  }

  return container[serviceName];
}

export function useServiceContainer(): ServiceContainer {
  const container = useContext(ServiceContext);

  if (!container) {
    throw new Error(
      'useServiceContainer must be used within a ServiceProvider. ' +
      'Make sure your component is wrapped in <ServiceProvider>.'
    );
  }

  return container;
}
