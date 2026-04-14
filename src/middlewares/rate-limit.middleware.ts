import { rateLimit, ipKeyGenerator } from "express-rate-limit";

/**
 * Rate limiting para creación de comentarios.
 *
 * @remarks
 * - Ventana: 1 minuto
 * - Máximo: 10 comentarios por ventana
 * - Se identifica por IP (req.ip)
 *
 * Configuración conservadora para evitar spam.
 */
export const commentCreateRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // máximo 10 comentarios por minuto
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: "Demasiados comentarios creados. Por favor espera un minuto antes de continuar."
  },
  // Usar IP como identificador con soporte IPv6
  keyGenerator: ipKeyGenerator
});

/**
 * Rate limiting para actualización de comentarios.
 *
 * @remarks
 * - Ventana: 1 minuto
 * - Máximo: 20 actualizaciones por ventana
 * - Menos restrictivo que creación porque ediciones son más frecuentes
 */
export const commentUpdateRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 20, // máximo 20 ediciones por minuto
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Demasiadas ediciones. Por favor espera un minuto antes de continuar."
  },
  keyGenerator: ipKeyGenerator
});

/**
 * Rate limiting para operaciones de likes.
 *
 * @remarks
 * - Ventana: 1 minuto
 * - Máximo: 30 likes/unlikes por ventana
 */
export const likeRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 30, // máximo 30 operaciones de like por minuto
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Demasiadas operaciones de like. Por favor espera un minuto antes de continuar."
  },
  keyGenerator: ipKeyGenerator
});
