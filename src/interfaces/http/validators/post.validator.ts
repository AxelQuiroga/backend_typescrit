import { z } from "zod";
import { idParam, paginationQuery } from "./common.js";

export const createPostSchema = {
  body: z.object({
    title: z.string().trim().min(3),
    content: z.string().trim().min(10)
  }).strict()
};

export const getPostsSchema = {
  query: paginationQuery
};

export const updatePostSchema = {
  params: idParam,
  body: z.object({
    title: z.string().trim().min(3).optional(),
    content: z.string().trim().min(10).optional()
  })
  .refine((data) => data.title !== undefined || data.content !== undefined, {
    message: "Debe enviar title o content"
  })
  .strict()
};

export const deletePostSchema = {
  params: idParam
};

export const getPostsByUserSchema = {
  params: z.object({
    username: z.string().trim().min(3).max(50)
  }),
  query: paginationQuery
};
