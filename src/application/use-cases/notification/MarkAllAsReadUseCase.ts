import type { NotificationRepository } from "../../../domain/repositories/NotificationRepository.js";

/**
 * Caso de uso para marcar todas las notificaciones no leídas como leídas.
 *
 * @example
 * ```typescript
 * const useCase = new MarkAllAsReadUseCase(notificationRepository);
 * const count = await useCase.execute("user-123");
 * console.log(count); // Cantidad de notificaciones marcadas
 * ```
 */
export class MarkAllAsReadUseCase {
  constructor(private notificationRepository: NotificationRepository) {}

  /**
   * Ejecuta el marcado de todas como leídas.
   *
   * @param userId - ID del usuario autenticado (del JWT)
   * @returns Cantidad de notificaciones marcadas como leídas
   */
  async execute(userId: string) {
    const count = await this.notificationRepository.markAllAsRead(userId);
    return count;
  }
}
