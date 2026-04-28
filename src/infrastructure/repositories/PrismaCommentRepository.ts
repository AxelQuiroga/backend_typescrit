import type { PrismaClient } from "@prisma/client";
import type { Comment } from "../../domain/entities/Comment.js";
import type { CommentRepository } from "../../domain/repositories/CommentRepository.js";

/**
 * Implementación de CommentRepository usando Prisma ORM.
 *
 * @remarks
 * Buenas prácticas aplicadas:
 * - Mapeo explícito entre Prisma entities y Domain entities
 * - Manejo de errores de Prisma (P2025 = not found)
 * - Paginación consistente (skip/take)
 * - Ordenamiento por defecto (createdAt DESC)
 */
export class PrismaCommentRepository implements CommentRepository {
  constructor(private prisma: PrismaClient) {}
  /**
   * Crea un comentario en la base de datos.
   *
   * @param data - Datos del comentario (content, authorId, postId, parentId?)
   * @returns Comment creado con fechas generadas por Prisma
   */
  async create(data: {
    content: string;
    authorId: string;
    postId: string;
    parentId?: string | null;
  }): Promise<Comment> {
    const comment = await this.prisma.comment.create({
      data: {
        content: data.content,
        authorId: data.authorId,
        postId: data.postId,
        parentId: data.parentId ?? null
      }
    });

    return this.toDomain(comment);
  }

  /**
   * Actualiza el contenido de un comentario.
   *
   * @param id - ID del comentario
   * @param content - Nuevo contenido
   * @returns Comment actualizado o null si no existe
   *
   * @remarks
   * Prisma lanza P2025 si el registro no existe. Lo capturamos
   * y retornamos null en lugar de propagar el error.
   */
  async update(id: string, content: string): Promise<Comment | null> {
    try {
      const comment = await this.prisma.comment.update({
        where: { id },
        data: { content }
      });
      return this.toDomain(comment);
    } catch (error: any) {
      // P2025 = Record to update not found
      if (error.code === "P2025") {
        return null;
      }
      throw error; // Re-lanzar otros errores inesperados
    }
  }

  /**
   * Elimina un comentario por ID.
   *
   * @param id - ID del comentario
   * @returns true si se eliminó, false si no existía
   *
   * @remarks
   * Idempotente: no hay error si el comentario ya fue eliminado.
   * Las respuestas deben eliminarse antes (lógica en DeleteCommentUseCase)
   * o configurar CASCADE en el schema de Prisma.
   */
  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.comment.delete({
        where: { id }
      });
      return true;
    } catch (error: any) {
      // P2025 = Record to delete does not exist
      if (error.code === "P2025") {
        return false;
      }
      throw error;
    }
  }

  /**
   * Busca un comentario por ID.
   *
   * @param id - ID a buscar
   * @returns Comment o null si no existe
   */
  async findById(id: string): Promise<Comment | null> {
    const comment = await this.prisma.comment.findUnique({
      where: { id }
    });

    return comment ? this.toDomain(comment) : null;
  }

  /**
   * Lista comentarios raíz de un post (parentId = null).
   *
   * @param postId - ID del post
   * @param page - Número de página (1-based)
   * @param limit - Items por página
   * @returns Lista paginada de comentarios + total
   *
   * @remarks
   * Solo comentarios raíz (sin parentId) para mostrar en el feed.
   * Orden: más recientes primero (createdAt DESC).
   */
  async findByPostId(
    postId: string,
    page: number,
    limit: number
  ): Promise<{ comments: Comment[]; total: number }> {
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: {
          postId,
          parentId: null // Solo comentarios raíz
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" }
      }),
      this.prisma.comment.count({
        where: {
          postId,
          parentId: null
        }
      })
    ]);

    return {
      comments: comments.map((c) => this.toDomain(c)),
      total
    };
  }

  /**
   * Lista respuestas de un comentario padre.
   *
   * @param parentId - ID del comentario padre
   * @param page - Número de página (1-based)
   * @param limit - Items por página
   * @returns Lista paginada de respuestas + total
   *
   * @remarks
   * Las respuestas son comentarios con parentId !== null.
   * Orden: más recientes primero.
   */
  async findRepliesByParentId(
    parentId: string,
    page: number,
    limit: number
  ): Promise<{ comments: Comment[]; total: number }> {
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { parentId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" }
      }),
      this.prisma.comment.count({
        where: { parentId }
      })
    ]);

    return {
      comments: comments.map((c) => this.toDomain(c)),
      total
    };
  }

  /**
   * Cuenta comentarios raíz de un post.
   *
   * @param postId - ID del post
   * @returns Número total de comentarios raíz
   */
  async countByPostId(postId: string): Promise<number> {
    return this.prisma.comment.count({
      where: {
        postId,
        parentId: null
      }
    });
  }

  /**
   * Verifica si un usuario es autor de un comentario.
   *
   * @param commentId - ID del comentario
   * @param userId - ID del usuario a verificar
   * @returns true si el usuario es el autor
   *
   * @remarks
   * Más eficiente que findById() porque solo cuenta, no carga el registro.
   */
  async isAuthor(commentId: string, userId: string): Promise<boolean> {
    const count = await this.prisma.comment.count({
      where: {
        id: commentId,
        authorId: userId
      }
    });
    return count > 0;
  }

  /**
   * Mapea un comentario de Prisma a la entidad de dominio.
   *
   * @param prismaComment - Objeto devuelto por Prisma
   * @returns Comment del dominio
   *
   * @remarks
   * Buena práctica: mantener el mapeo explícito en un método privado.
   * Si cambia el schema de Prisma, solo tocamos aquí.
   */
  private toDomain(prismaComment: {
    id: string;
    content: string;
    authorId: string;
    postId: string;
    parentId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Comment {
    return {
      id: prismaComment.id,
      content: prismaComment.content,
      authorId: prismaComment.authorId,
      postId: prismaComment.postId,
      parentId: prismaComment.parentId,
      createdAt: prismaComment.createdAt,
      updatedAt: prismaComment.updatedAt
    };
  }
}
