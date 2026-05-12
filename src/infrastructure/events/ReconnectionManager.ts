import { ConnectionStateMachine, ConnectionState, type RetryConfig } from './ConnectionStateMachine.js';
import { EventEmitter } from 'events';

/**
 * Gestor de reconexión automática para RabbitMQ.
 * 
 * @remarks
 * Coordina la lógica de reconexión con exponential backoff y jitter.
 * Se integra con la state machine para manejar el ciclo de vida completo.
 */
export class ReconnectionManager extends EventEmitter {
  private reconnectTimer?: NodeJS.Timeout | undefined;
  private isShuttingDown = false;

  constructor(
    private readonly stateMachine: ConnectionStateMachine,
    private readonly retryConfig: RetryConfig
  ) {
    super();
    this.setupStateListeners();
  }

  /**
   * Configura listeners para cambios de estado en la state machine.
   */
  private setupStateListeners(): void {
    this.stateMachine.onStateChange((state) => {
      this.handleStateChange(state);
    });
  }

  /**
   * Maneja cambios de estado y dispara acciones correspondientes.
   */
  private handleStateChange(state: ConnectionState): void {
    switch (state) {
      case ConnectionState.RECONNECTING:
        this.scheduleReconnection();
        break;
      
      case ConnectionState.CONNECTED:
        this.clearReconnectionTimer();
        this.emit('connected');
        break;
      
      case ConnectionState.FAILED:
        this.clearReconnectionTimer();
        this.emit('failed', this.stateMachine.error);
        break;
      
      case ConnectionState.SHUTTING_DOWN:
        this.clearReconnectionTimer();
        this.isShuttingDown = true;
        this.emit('shutdown');
        break;
    }
  }

  /**
   * Programa la próxima reconexión con exponential backoff y jitter.
   */
  private scheduleReconnection(): void {
    if (this.isShuttingDown || !this.stateMachine.canRetry()) {
      return;
    }

    const delay = this.stateMachine.calculateRetryDelay();
    const summary = this.stateMachine.getStatusSummary();

    console.log(`[RabbitMQ] Programando reconexión en ${Math.round(delay)}ms (intentos: ${summary.attempts}/${summary.maxRetries})`);

    this.reconnectTimer = setTimeout(async () => {
      if (this.isShuttingDown) {
        return;
      }

      try {
        this.emit('reconnect_attempt', summary.attempts);
        await this.performReconnection();
      } catch (error) {
        console.error('[RabbitMQ] Error en intento de reconexión:', error);
        // La state machine manejará el error y programará el siguiente intento
      }
    }, delay);
  }

  /**
   * Realiza el intento de reconexión.
   */
  private async performReconnection(): Promise<void> {
    if (this.isShuttingDown) {
      throw new Error('Cannot reconnect while shutting down');
    }

    // Notificar que estamos iniciando la reconexión
    this.stateMachine.startConnecting();
    
    // Emitir evento para que el RabbitMQEventBus realice la conexión real
    this.emit('reconnect_required');
  }

  /**
   * Limpia el timer de reconexión.
   */
  private clearReconnectionTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
  }

  /**
   * Notifica que la conexión se perdió.
   * 
   * @param error - Error que causó la desconexión (opcional)
   */
  notifyConnectionLost(error?: Error): void {
    if (this.isShuttingDown) {
      return;
    }

    console.log('[RabbitMQ] Conexión perdida, iniciando reconexión automática');
    this.stateMachine.connectionLost(error);
  }

  /**
   * Notifica que la conexión se estableció exitosamente.
   */
  notifyConnectionEstablished(): void {
    if (this.isShuttingDown) {
      return;
    }

    console.log('[RabbitMQ] Conexión establecida exitosamente');
    this.stateMachine.connectionEstablished();
  }

  /**
   * Inicia el proceso de shutdown graceful.
   */
  async shutdown(): Promise<void> {
    console.log('[RabbitMQ] Iniciando shutdown del manager de reconexión');
    
    this.isShuttingDown = true;
    this.stateMachine.startShutdown();
    this.clearReconnectionTimer();
    
    // Esperar a que cualquier reconexión en progreso termine (con timeout)
    await new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        console.warn('[RabbitMQ] Timeout esperando shutdown, forzando completion');
        resolve();
      }, 5000); // 5 segundos máximo

      if (this.stateMachine.state === ConnectionState.SHUTTING_DOWN) {
        clearTimeout(timeout);
        resolve();
      } else {
        const checkShutdown = () => {
          if (this.stateMachine.state === ConnectionState.SHUTTING_DOWN) {
            clearTimeout(timeout);
            resolve();
          } else {
            setTimeout(checkShutdown, 100);
          }
        };
        checkShutdown();
      }
    });

    this.removeAllListeners();
    console.log('[RabbitMQ] Manager de reconexión detenido');
  }

  /**
   * Reinicia el manager para un nuevo ciclo de conexión.
   */
  reset(): void {
    this.isShuttingDown = false;
    this.clearReconnectionTimer();
    this.stateMachine.reset();
  }

  /**
   * Obtiene el estado actual de la reconexión.
   */
  getStatus(): {
    state: ConnectionState;
    attempts: number;
    maxRetries: number;
    canRetry: boolean;
    isShuttingDown: boolean;
    lastError: string | undefined;
  } {
    const summary = this.stateMachine.getStatusSummary();
    return {
      ...summary,
      isShuttingDown: this.isShuttingDown,
      lastError: summary.lastError
    };
  }
}
