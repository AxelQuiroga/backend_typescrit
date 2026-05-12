/**
 * DTO para la petición HTTP de crear un nuevo post.
 *
 * @remarks
 * El userId NO va aquí - viene del JWT en el header Authorization.
 * El mapper se encarga de limpiar y validar los campos antes de pasar
 * al use case de aplicación.
 * 
 * Validaciones del mapper:
 * - title: mínimo 3 caracteres, máximo 200
 * - content: mínimo 10 caracteres, máximo 5000
 * - Se eliminan espacios en blanco al inicio y final
 */
export interface CreatePostRequest {
  /** Título del post (3-200 caracteres) */
  title: string;
  
  /** Contenido del post (10-5000 caracteres) - texto plano o markdown */
  content: string;
}