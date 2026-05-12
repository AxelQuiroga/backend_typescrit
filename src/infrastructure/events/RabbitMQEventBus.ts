import amqp from "amqplib";
import type { EventBus } from "../../domain/events/EventBus.js";
import { env } from "../../config/env.js";
import { ConnectionStateMachine, ConnectionState, type RetryConfig } from "./ConnectionStateMachine.js";
import { ReconnectionManager } from "./ReconnectionManager.js";
import { ConsumerRegistry } from "./ConsumerRegistry.js";

type Handler = (payload: unknown) => void | Promise<void>;

/**
 * Configuración por defecto para retry con exponential backoff y jitter.
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 10,
  initialDelay: 1000, // 1 segundo
  maxDelay: 30000, // 30 segundos máximo
  backoffMultiplier: 2,
  jitterFactor: 0.1 // ±10% de variación
};

export class RabbitMQEventBus implements EventBus {
  private connection?: Awaited<ReturnType<typeof amqp.connect>> | undefined;
  private channel?: amqp.Channel | undefined;
  private stateMachine: ConnectionStateMachine;
  private reconnectionManager: ReconnectionManager;
  private consumerRegistry: ConsumerRegistry;
  private pendingMessages: Array<{ event: string; payload: unknown }> = [];
  private retryConfig: RetryConfig;
  private isConnecting = false;

  constructor(retryConfig?: Partial<RetryConfig>) {
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
    this.stateMachine = new ConnectionStateMachine(this.retryConfig);
    this.reconnectionManager = new ReconnectionManager(this.stateMachine, this.retryConfig);
    this.consumerRegistry = new ConsumerRegistry();
    this.setupReconnectionListeners();
  }

  /**
   * Configura listeners para eventos del reconnection manager.
   */
  private setupReconnectionListeners(): void {
    this.reconnectionManager.on('reconnect_required', async () => {
      await this.performConnection();
    });

    this.reconnectionManager.on('connected', () => {
      console.log('[RabbitMQ] Reconexión exitosa');
      this.setupConnectionListeners();
      this.restoreConsumers();
      this.flushPendingMessages();
    });

    this.reconnectionManager.on('failed', (error) => {
      console.error('[RabbitMQ] Falló la reconexión después de todos los intentos:', error);
    });

    this.reconnectionManager.on('reconnect_attempt', (attempt) => {
      console.log(`[RabbitMQ] Intento de reconexión #${attempt}`);
    });
  }

  /**
   * Establece los listeners de eventos de la conexión RabbitMQ.
   */
  private setupConnectionListeners(): void {
    if (!this.connection) return;

    // Connection events
    this.connection.on('close', () => {
      console.log('[RabbitMQ] Conexión cerrada');
      this.reconnectionManager.notifyConnectionLost();
    });

    this.connection.on('error', (err) => {
      console.error('[RabbitMQ] Error de conexión:', err.message);
      this.reconnectionManager.notifyConnectionLost(err);
    });

    this.connection.on('blocked', (reason) => {
      console.warn('[RabbitMQ] Conexión bloqueada:', reason);
    });

    this.connection.on('unblocked', () => {
      console.log('[RabbitMQ] Conexión desbloqueada');
    });

    // Channel events
    if (this.channel) {
      this.channel.on('close', () => {
        console.log('[RabbitMQ] Canal cerrado');
        this.consumerRegistry.clearQueueConsumers();
      });

      this.channel.on('error', (err) => {
        console.error('[RabbitMQ] Error en canal:', err.message);
      });

      this.channel.on('return', (msg) => {
        console.warn('[RabbitMQ] Mensaje devuelto:', msg.fields.routingKey);
      });
    }
  }

  /**
   * Realiza la conexión real a RabbitMQ.
   */
  private async performConnection(): Promise<void> {
    if (this.isConnecting) {
      console.log('[RabbitMQ] Ya hay una conexión en progreso, esperando...');
      return;
    }

    this.isConnecting = true;
    this.stateMachine.startConnecting();

    try {
      console.log('[RabbitMQ] Conectando a RabbitMQ...');
      this.connection = await amqp.connect(env.RABBITMQ_URL, {
        heartbeat: 60,
        timeout: 10000
      });
      
      this.channel = await this.connection.createChannel();
      
      // Aseguramos la cola compartida
      await this.channel.assertQueue("notifications", { durable: true });
      
      this.reconnectionManager.notifyConnectionEstablished();
      console.log('[RabbitMQ] Conectado y listo para despachar');

    } catch (error) {
      console.error('[RabbitMQ] Error al conectar:', error);
      this.reconnectionManager.notifyConnectionLost(error instanceof Error ? error : new Error('Unknown connection error'));
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  /**
   * Restaura los consumidores después de una reconexión.
   */
  private restoreConsumers(): void {
    if (this.consumerRegistry.hasAnyHandlers()) {
      console.log('[RabbitMQ] Restaurando consumidores...');
      this.startConsuming();
    }
  }

  /**
   * Envía los mensajes pendientes después de reconectarse.
   */
  private flushPendingMessages(): void {
    if (this.pendingMessages.length > 0) {
      console.log(`[RabbitMQ] Enviando ${this.pendingMessages.length} mensajes pendientes...`);
      for (const { event, payload } of this.pendingMessages) {
        this.publish(event, payload);
      }
      this.pendingMessages = [];
    }
  }

  /**
   * Conecta a RabbitMQ con reconexión automática.
   */
  async connect(): Promise<void> {
    await this.performConnection();
  }

  /**
   * Emite un evento a RabbitMQ.
   */
  emit(event: string, payload: unknown): void {
    if (!this.channel || this.stateMachine.state !== ConnectionState.CONNECTED) {
      this.pendingMessages.push({ event, payload });
      return;
    }
    this.publish(event, payload);
  }

  /**
   * Publica un mensaje en la cola.
   */
  private publish(event: string, payload: unknown): void {
    if (!this.channel) return;
    
    try {
      const buffer = Buffer.from(JSON.stringify({ event, payload }));
      this.channel.sendToQueue("notifications", buffer, {
        persistent: true,
        deliveryMode: 2,
        timestamp: Date.now(),
        messageId: `${event}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      });
    } catch (error) {
      console.error('[RabbitMQ] Error al publicar mensaje:', error);
      // Si falla la publicación, lo agregamos a pendientes
      this.pendingMessages.push({ event, payload });
    }
  }

  /**
   * Registra un handler para un evento.
   */
  on(event: string, handler: Handler): void {
    this.consumerRegistry.registerHandler(event, handler);

    if (this.stateMachine.state === ConnectionState.CONNECTED && 
        !this.consumerRegistry.isQueueBeingConsumed("notifications")) {
      this.startConsuming();
    }
  }

  /**
   * Inicia el consumidor de la cola.
   */
  private async startConsuming(): Promise<void> {
    if (!this.channel || this.consumerRegistry.isQueueBeingConsumed("notifications")) {
      return;
    }

    try {
      console.log("[RabbitMQ] Worker de despacho iniciado");
      this.consumerRegistry.markQueueAsConsuming("notifications");

      await this.channel.consume("notifications", async (msg) => {
        if (!msg) return;

        try {
          const content = JSON.parse(msg.content.toString());
          const targetHandlers = this.consumerRegistry.getHandlers(content.event);

          if (targetHandlers && targetHandlers.length > 0) {
            // Ejecutar todos los handlers para este evento
            await Promise.allSettled(targetHandlers.map(h => h(content.payload)));
          }

          this.channel!.ack(msg);
        } catch (err) {
          console.error("[RabbitMQ] Error en dispatcher:", err);
          this.channel!.nack(msg, false, false);
        }
      }, {
        consumerTag: 'event-bus-consumer',
        noAck: false
      });

    } catch (error) {
      console.error('[RabbitMQ] Error al iniciar consumidor:', error);
      this.consumerRegistry.markQueueAsNotConsuming("notifications");
    }
  }

  /**
   * Desconecta de RabbitMQ gracefulmente.
   */
  async disconnect(): Promise<void> {
    console.log('[RabbitMQ] Iniciando desconexión...');
    
    await this.reconnectionManager.shutdown();
    
    if (this.channel) {
      try {
        await this.channel.cancel('event-bus-consumer');
        await this.channel.close();
      } catch (error) {
        console.error('[RabbitMQ] Error cerrando canal:', error);
      } finally {
        this.channel = undefined; // Prevenir memory leak
      }
    }

    if (this.connection) {
      try {
        await this.connection.close();
      } catch (error) {
        console.error('[RabbitMQ] Error cerrando conexión:', error);
      } finally {
        this.connection = undefined; // Prevenir memory leak
      }
    }

    this.consumerRegistry.clear();
    this.isConnecting = false;
    console.log('[RabbitMQ] Desconectado');
  }

  /**
   * Obtiene el estado actual del EventBus.
   */
  getStatus(): {
    connectionState: ConnectionState;
    isConnecting: boolean;
    pendingMessages: number;
    handlers: {
      totalEvents: number;
      totalHandlers: number;
      activeQueues: number;
    };
    reconnection: {
      attempts: number;
      maxRetries: number;
      canRetry: boolean;
      lastError: string | undefined;
    };
  } {
    const reconnectionStatus = this.reconnectionManager.getStatus();
    const handlerStats = this.consumerRegistry.getStats();

    return {
      connectionState: this.stateMachine.state,
      isConnecting: this.isConnecting,
      pendingMessages: this.pendingMessages.length,
      handlers: {
        totalEvents: handlerStats.totalEvents,
        totalHandlers: handlerStats.totalHandlers,
        activeQueues: handlerStats.activeQueues
      },
      reconnection: {
        attempts: reconnectionStatus.attempts,
        maxRetries: reconnectionStatus.maxRetries,
        canRetry: reconnectionStatus.canRetry,
        lastError: reconnectionStatus.lastError
      }
    };
  }
}
