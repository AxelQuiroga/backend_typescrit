export interface EventBus {
  emit(event: string, payload: any): void;
  on(event: string, handler: (payload: any) => void): void;
}