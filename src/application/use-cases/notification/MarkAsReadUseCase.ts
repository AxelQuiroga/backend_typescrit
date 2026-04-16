import type { NotificationRepository } from "../../../domain/repositories/NotificationRepository.js";

/**
 * Caso de uso para marcar una notificación como leída.
 *
 * @remarks
 * Lógica de negocio:
 * - Verifica que la notificación pertenezca al usuario
 * - Marca como leída solo si pertenece al usuario
 *
 * @example
 * ```typescript
 * const useCase = new MarkAsReadUseCase(notificationRepository);
 * const success = await useCase.execute("user-123", "notif-456");
 * console.log(success); // true si se marcó, false si no pertenece
 * ```
 */
export class MarkAsReadUseCase {
  constructor(private notificationRepository: NotificationRepository) {}

  /**
   * Ejecuta el marcado como leída.
   *
   * @param userId - ID del usuario autenticado (del JWT)
   * @param notificationId - ID de la notificación a marcar
   * @returns true si se marcó exitosamente, false si no pertenece al usuario
   */
  async execute(userId: string, notificationId: string) {
    const success = await this.notificationRepository.markAsRead(notificationId, userId);
    return success;
  }
}
