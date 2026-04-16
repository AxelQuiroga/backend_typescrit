import type { NotificationRepository } from "../../../domain/repositories/NotificationRepository.js";

/**
 * Caso de uso para obtener notificaciones del usuario.
 *
 * @remarks
 * Lógica de negocio:
 * - Obtiene notificaciones paginadas del usuario
 * - Ordena por fecha de creación descendente
 *
 * @example
 * ```typescript
 * const useCase = new GetNotificationsUseCase(notificationRepository);
 * const result = await useCase.execute("user-123", 1, 10);
 * console.log(result.notifications); // Array de notificaciones
 * ```
 */
export class GetNotificationsUseCase {
  constructor(private notificationRepository: NotificationRepository) {}

  /**
   * Ejecuta la obtención de notificaciones.
   *
   * @param userId - ID del usuario autenticado (del JWT)
   * @param page - Número de página (default: 1)
   * @param limit - Límite de resultados por página (default: 10)
   * @returns Notificaciones paginadas con metadata
   */
  async execute(userId: string, page: number, limit: number) {
    const result = await this.notificationRepository.findByUserId(userId, page, limit);
    return result;
  }
}
