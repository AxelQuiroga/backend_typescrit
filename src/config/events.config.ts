import { RabbitMQEventBus } from "../infrastructure/events/RabbitMQEventBus.js";
import { NotificationListeners } from "../infrastructure/events/NotificationListeners.js";
import { PrismaNotificationRepository } from "../infrastructure/repositories/PrismaNotificationRepository.js";
import { PrismaCommentRepository } from "../infrastructure/repositories/PrismaCommentRepository.js";
import { prisma } from "../infrastructure/database/prisma.js";

/**
 * Configuración personalizada para reconexión automática.
 * 
 * @remarks
 * Estos valores están optimizados para producción:
 * - Hasta 10 intentos de reconexión
 * - Espera exponencial desde 1s hasta 30s máximo
 * - Jitter del 10% para prevenir thundering herd
 */
const retryConfig = {
  maxRetries: 10,
  initialDelay: 1000, // 1 segundo
  maxDelay: 30000, // 30 segundos máximo
  backoffMultiplier: 2,
  jitterFactor: 0.1 // ±10% de variación aleatoria
};

// 1. Crear EventBus con configuración de reconexión robusta
export const eventBus = new RabbitMQEventBus(retryConfig);

// 2. Crear repositorios
const notificationRepo = new PrismaNotificationRepository(prisma);
const commentRepo = new PrismaCommentRepository(prisma);

// 3. Registrar listeners (se ejecuta sync, pero consume empieza luego de connect)
const notificationListeners = new NotificationListeners(notificationRepo, commentRepo, eventBus);

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