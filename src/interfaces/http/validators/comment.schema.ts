import { z } from "zod";

/**
 * Schema para validar el ID en parámetros de URL (posts o comments).
 */
export const commentIdParamsSchema = z.object({
  id: z.string().uuid({ message: "El ID debe ser un UUID válido" })
});

/**
 * Schema para validar el body de crear comentario.
 */
export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "El contenido es requerido")
    .max(2000, "El contenido no puede exceder 2000 caracteres"),
  parentId: z
    .string()
    .uuid("El parentId debe ser un UUID válido")
    .nullable()
    .optional()
});

/**
 * Schema para validar el body de actualizar comentario.
 */
export const updateCommentSchema = z.object({
  content: z
    .string()
    .min(1, "El contenido es requerido")
    .max(2000, "El contenido no puede exceder 2000 caracteres")
});

/**
 * Schema para validar query params de paginación.
 */
export const paginationQuerySchema = z.object({
  page: z
    .string()
    .default("1")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1, "La página debe ser mayor a 0")),
  limit: z
    .string()
    .default("10")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(100, "El límite máximo es 100"))
});
