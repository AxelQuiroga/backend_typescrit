/**
 * Registry para manejar consumidores y sus handlers durante reconexiones.
 * 
 * @remarks
 * Asegura que los handlers registrados se mantengan entre reconexiones
 * y puedan ser re-registrados automáticamente cuando la conexión se restablece.
 */
export class ConsumerRegistry {
  private handlers = new Map<string, Array<(payload: unknown) => void | Promise<void>>>();
  private queueConsumers = new Map<string, boolean>();

  /**
   * Registra un handler para un evento específico.
   * 
   * @param event - Nombre del evento
   * @param handler - Función handler para el evento
   */
  registerHandler(event: string, handler: (payload: unknown) => void | Promise<void>): void {
    const eventHandlers = this.handlers.get(event) || [];
    eventHandlers.push(handler);
    this.handlers.set(event, eventHandlers);
  }

  /**
   * Remueve un handler específico para un evento.
   * 
   * @param event - Nombre del evento
   * @param handler - Handler a remover
   */
  unregisterHandler(event: string, handler: (payload: unknown) => void | Promise<void>): void {
    const eventHandlers = this.handlers.get(event);
    if (!eventHandlers) return;

    // Crear nuevo array sin el handler (operación atómica)
    const filteredHandlers = eventHandlers.filter(h => h !== handler);
    
    if (filteredHandlers.length === 0) {
      this.handlers.delete(event);
    } else {
      this.handlers.set(event, filteredHandlers);
    }
  }

  /**
   * Obtiene todos los handlers para un evento específico.
   * 
   * @param event - Nombre del evento
   * @returns Array de handlers o undefined si no hay ninguno
   */
  getHandlers(event: string): Array<(payload: unknown) => void | Promise<void>> | undefined {
    return this.handlers.get(event);
  }

  /**
   * Obtiene todos los eventos registrados.
   * 
   * @returns Array de nombres de eventos
   */
  getRegisteredEvents(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Verifica si hay handlers registrados para un evento.
   * 
   * @param event - Nombre del evento
   * @returns true si hay handlers registrados
   */
  hasHandlers(event: string): boolean {
    const handlers = this.handlers.get(event);
    return handlers !== undefined && handlers.length > 0;
  }

  /**
   * Marca una cola como siendo consumida.
   * 
   * @param queueName - Nombre de la cola
   */
  markQueueAsConsuming(queueName: string): void {
    this.queueConsumers.set(queueName, true);
  }

  /**
   * Marca una cola como no siendo consumida.
   * 
   * @param queueName - Nombre de la cola
   */
  markQueueAsNotConsuming(queueName: string): void {
    this.queueConsumers.set(queueName, false);
  }

  /**
   * Verifica si una cola está siendo consumida.
   * 
   * @param queueName - Nombre de la cola
   * @returns true si está siendo consumida
   */
  isQueueBeingConsumed(queueName: string): boolean {
    return this.queueConsumers.get(queueName) || false;
  }

  /**
   * Obtiene todas las colas que están siendo consumidas.
   * 
   * @returns Array de nombres de colas
   */
  getActiveQueues(): string[] {
    return Array.from(this.queueConsumers.entries())
      .filter(([_, isConsuming]) => isConsuming)
      .map(([queueName]) => queueName);
  }

  /**
   * Limpia todos los consumidores de colas.
   * Útil durante reconexiones para resetear el estado.
   */
  clearQueueConsumers(): void {
    this.queueConsumers.clear();
  }

  /**
   * Verifica si hay handlers registrados en total.
   * 
   * @returns true si hay al menos un handler registrado
   */
  hasAnyHandlers(): boolean {
    return this.handlers.size > 0;
  }

  /**
   * Obtiene estadísticas del registry para logging.
   * 
   * @returns Objeto con estadísticas
   */
  getStats(): {
    totalEvents: number;
    totalHandlers: number;
    activeQueues: number;
    eventsWithHandlers: string[];
  } {
    const totalHandlers = Array.from(this.handlers.values())
      .reduce((total, handlers) => total + handlers.length, 0);

    return {
      totalEvents: this.handlers.size,
      totalHandlers,
      activeQueues: this.getActiveQueues().length,
      eventsWithHandlers: this.getRegisteredEvents()
    };
  }

  /**
   * Limpia todos los handlers y consumidores.
   * Útil durante shutdown completo.
   */
  clear(): void {
    this.handlers.clear();
    this.queueConsumers.clear();
  }
}
