import type { EventBus } from '../../src/domain/events/EventBus';

export class InMemoryEventBus implements EventBus {
  private handlers: Map<string, Array<(payload: unknown) => void | Promise<void>>> = new Map();
  public emittedEvents: Array<{ event: string; payload: unknown }> = [];

  emit(event: string, payload: unknown): void {
    this.emittedEvents.push({ event, payload });
    const handlers = this.handlers.get(event) || [];
    for (const handler of handlers) {
      handler(payload);
    }
  }

  on(event: string, handler: (payload: unknown) => void | Promise<void>): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
  }

  clear(): void {
    this.handlers.clear();
    this.emittedEvents = [];
  }
}
