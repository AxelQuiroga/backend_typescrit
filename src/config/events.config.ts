import { RabbitMQEventBus } from "../infrastructure/events/RabbitMQEventBus.js";
import { NotificationListeners } from "../infrastructure/events/NotificationListeners.js";
import { createNotificationService } from "../infrastructure/di/factory.js";

/**
 * Configuración personalizada para reconexión automática.
 */
const retryConfig = {
  maxRetries: 10,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  jitterFactor: 0.1
};

// 1. Crear EventBus
export const eventBus = new RabbitMQEventBus(retryConfig);

// 2. Crear servicios y listeners vía Factory
const notificationService = createNotificationService();
const notificationListeners = new NotificationListeners(notificationService, eventBus);

// 4. Conectar a RabbitMQ (llamar antes de app.listen)
export async function connectEventBus(): Promise<void> {
  await eventBus.connect();
}

/**
 * Obtiene el estado actual del EventBus para monitoreo.
 */
export function getEventBusStatus() {
  return eventBus.getStatus();
}

/**
 * Desconecta el EventBus gracefulmente.
 * Útil para shutdown de la aplicación.
 */
export async function disconnectEventBus(): Promise<void> {
  await eventBus.disconnect();
}

/**
 * Configura graceful shutdown del EventBus.
 */
export function setupEventBusGracefulShutdown(): void {
  const gracefulShutdown = async (signal: string) => {
    console.log(`\n📡 Recibido ${signal}, iniciando shutdown del EventBus...`);
    
    try {
      await disconnectEventBus();
      console.log('✅ EventBus desconectado exitosamente');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error en shutdown del EventBus:', error);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}