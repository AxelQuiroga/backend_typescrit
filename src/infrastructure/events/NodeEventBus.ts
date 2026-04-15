import { EventEmitter } from 'events';
import type { EventBus } from '../../domain/events/EventBus.js';
 
export class NodeEventBus implements EventBus {
  private emitter = new EventEmitter();
 
  emit(event: string, payload: any): void {
    this.emitter.emit(event, payload);
  }
 
  on(event: string, handler: (payload: any) => void): void {
    this.emitter.on(event, handler);
  }
}