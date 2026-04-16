import { EventEmitter } from 'events';
import type { EventBus } from '../../domain/events/EventBus.js';

/**
 * EventBus implementation using Node.js EventEmitter.
 *
 * LIMITATIONS:
 * - EventEmitter is synchronous by design
 * - Async listeners must handle their own errors (try-catch)
 * - Errors in async listeners are NOT automatically propagated to error handlers
 * - This is intentional: fire-and-forget events should not block the caller
 *
 * For guaranteed delivery or better error handling, consider:
 * - Message queues (RabbitMQ, Kafka)
 * - eventemitter2 (better async support, but has ESM import issues in v6)
 */
export class NodeEventBus implements EventBus {
  private emitter = new EventEmitter();

  constructor() {
    // Handle uncaught errors in event listeners
    this.emitter.on('error', (error: Error) => {
      console.error('[EventBus] Error en listener:', error);
    });
    
    // Set max listeners to prevent memory leaks
    this.emitter.setMaxListeners(10);
  }

  emit(event: string, payload: any): void {
    this.emitter.emit(event, payload);
  }

  on(event: string, handler: (payload: any) => void): void {
    this.emitter.on(event, handler);
  }
}