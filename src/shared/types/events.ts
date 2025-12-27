// TODO: Use event types for Event Bus
export type EventType =
  | 'node:selected';

export interface NodeSelectedPayload {
  nodeId: string | null;
}

export interface EventPayloadMap {
  'node:selected': NodeSelectedPayload;
}
