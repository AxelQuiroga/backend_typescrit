import type { NotificationRepository } from "../../../domain/repositories/NotificationRepository.js";

/**
 * Caso de uso para contar notificaciones no leídas del usuario.
 *
 * @example
 * ```typescript
 * const useCase = new GetUnreadCountUseCase(notificationRepository);
 * const count = await useCase.execute("user-123");
 * console.log(count); // Número de notificaciones no leídas
 * ```
 */
export class GetUnreadCountUseCase {
  constructor(private notificationRepository: NotificationRepository) {}

  /**
   * Ejecuta el conteo de notificaciones no leídas.
   *
   * @param userId - ID del usuario autenticado (del JWT)
   * @returns Cantidad de notificaciones no leídas
   */
  async execute(userId: string) {
    const count = await this.notificationRepository.countUnread(userId);
    return count;
  }
}
