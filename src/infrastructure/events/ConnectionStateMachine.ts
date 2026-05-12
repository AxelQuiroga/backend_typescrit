/**
 * Estados de conexión para RabbitMQEventBus.
 * 
 * Permite un control granular del ciclo de vida de la conexión
 * y previene condiciones de carrera en la reconexión.
 */
export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  FAILED = 'failed',
  SHUTTING_DOWN = 'shutting_down'
}

/**
 * Configuración de retry con exponential backoff y jitter.
 * 
 * @remarks
 * El jitter (variación aleatoria) previene que múltiples clientes
 * se reconecten exactamente al mismo tiempo (thundering herd problem).
 */
export interface RetryConfig {
  /** Máximo número de intentos de reconexión */
  maxRetries: number;
  /** Delay inicial en milisegundos */
  initialDelay: number;
  /** Delay máximo en milisegundos */
  maxDelay: number;
  /** Multiplicador para exponential backoff */
  backoffMultiplier: number;
  /** Factor de jitter (0-1) para variación aleatoria */
  jitterFactor: number;
}

/**
 * Máquina de estados para gestionar el ciclo de vida de la conexión.
 * 
 * @remarks
 * Previene transiciones inválidas y maneja el estado centralizado
 * para que todos los componentes puedan consultar el estado actual.
 */
export class ConnectionStateMachine {
  private currentState: ConnectionState = ConnectionState.DISCONNECTED;
  private retryCount = 0;
  private lastError?: Error | undefined;
  private readonly listeners = new Set<(state: ConnectionState) => void>();

  constructor(private readonly retryConfig: RetryConfig) {
    this.validateRetryConfig();
  }

  /**
   * Valida la configuración de retry.
   * 
   * @throws Error si la configuración es inválida
   */
  private validateRetryConfig(): void {
    if (this.retryConfig.maxRetries < 0) {
      throw new Error('maxRetries debe ser >= 0');
    }
    if (this.retryConfig.initialDelay < 0) {
      throw new Error('initialDelay debe ser >= 0');
    }
    if (this.retryConfig.maxDelay < this.retryConfig.initialDelay) {
      throw new Error('maxDelay debe ser >= initialDelay');
    }
    if (this.retryConfig.backoffMultiplier <= 1) {
      throw new Error('backoffMultiplier debe ser > 1');
    }
    if (this.retryConfig.jitterFactor < 0 || this.retryConfig.jitterFactor > 1) {
      throw new Error('jitterFactor debe estar entre 0 y 1');
    }
  }

  /**
   * Obtiene el estado actual de la conexión.
   */
  get state(): ConnectionState {
    return this.currentState;
  }

  /**
   * Obtiene el número de intentos de reconexión actuales.
   */
  get attempts(): number {
    return this.retryCount;
  }

  /**
   * Obtiene el último error ocurrido.
   */
  get error(): Error | undefined {
    return this.lastError;
  }

  /**
   * Registra un listener para cambios de estado.
   */
  onStateChange(listener: (state: ConnectionState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notifica a todos los listeners sobre un cambio de estado.
   */
  private notifyStateChange(): void {
    this.listeners.forEach(listener => listener(this.currentState));
  }

  /**
   * Calcula el delay para el próximo intento de reconexión.
   * 
   * Usa exponential backoff con jitter para prevenir thundering herd.
   */
  calculateRetryDelay(): number {
    const exponentialDelay = this.retryConfig.initialDelay * 
      Math.pow(this.retryConfig.backoffMultiplier, this.retryCount);
    
    const cappedDelay = Math.min(exponentialDelay, this.retryConfig.maxDelay);
    
    // Agregar jitter: ±jitterFactor% del delay
    const jitter = cappedDelay * this.retryConfig.jitterFactor;
    const randomJitter = (Math.random() - 0.5) * 2 * jitter;
    
    return Math.max(0, cappedDelay + randomJitter);
  }

  /**
   * Verifica si se puede intentar reconectar.
   */
  canRetry(): boolean {
    return this.retryCount < this.retryConfig.maxRetries &&
           this.currentState === ConnectionState.DISCONNECTED;
  }

  /**
   * Transición a estado CONNECTING.
   */
  startConnecting(): void {
    if (this.currentState === ConnectionState.SHUTTING_DOWN) {
      throw new Error('Cannot connect while shutting down');
    }
    
    this.currentState = ConnectionState.CONNECTING;
    this.notifyStateChange();
  }

  /**
   * Transición a estado CONNECTED.
   * Resetea el contador de retries en conexiones exitosas.
   */
  connectionEstablished(): void {
    this.currentState = ConnectionState.CONNECTED;
    this.retryCount = 0;
    this.lastError = undefined;
    this.notifyStateChange();
  }

  /**
   * Transición a DISCONNECTED.
   * Incrementa el contador de retries si no es un shutdown normal.
   */
  connectionLost(error?: Error): void {
    if (this.currentState === ConnectionState.SHUTTING_DOWN) {
      this.currentState = ConnectionState.DISCONNECTED;
      this.notifyStateChange();
      return;
    }

    this.lastError = error;
    
    // Evaluar si podemos reintentar ANTES de incrementar el contador
    const canRetryNext = this.retryCount < this.retryConfig.maxRetries;
    
    this.retryCount++;
    
    if (canRetryNext) {
      this.currentState = ConnectionState.RECONNECTING;
    } else {
      this.currentState = ConnectionState.FAILED;
    }
    
    this.notifyStateChange();
  }

  /**
   * Transición a SHUTTING_DOWN.
   * Previene nuevos intentos de conexión.
   */
  startShutdown(): void {
    this.currentState = ConnectionState.SHUTTING_DOWN;
    this.notifyStateChange();
  }

  /**
   * Resetea la máquina de estados al estado inicial.
   */
  reset(): void {
    this.currentState = ConnectionState.DISCONNECTED;
    this.retryCount = 0;
    this.lastError = undefined;
    this.notifyStateChange();
  }

  /**
   * Obtiene un resumen del estado actual para logging.
   */
  getStatusSummary(): {
    state: ConnectionState;
    attempts: number;
    maxRetries: number;
    lastError: string | undefined;
    canRetry: boolean;
  } {
    return {
      state: this.currentState,
      attempts: this.retryCount,
      maxRetries: this.retryConfig.maxRetries,
      lastError: this.lastError?.message,
      canRetry: this.canRetry()
    };
  }
}
