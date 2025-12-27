import type { IEventBus } from '../interfaces';

export class EventBus implements IEventBus {
  private listeners = new Map<string, Set<(payload: unknown) => void>>();

  emit(event: string, payload?: unknown): void {
    const handlers = this.listeners.get(event);
    console.log(`[EventBus] emit "${event}", handlers: ${handlers?.size ?? 0}`);
    if (handlers) {
      handlers.forEach((handler) => handler(payload));
    }
  }

  on(event: string, handler: (payload: unknown) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
    console.log(`[EventBus] on "${event}", total handlers: ${this.listeners.get(event)!.size}`);

    return () => this.off(event, handler);
  }

  off(event: string, handler: (payload: unknown) => void): void {
    this.listeners.get(event)?.delete(handler);
  }
}
