import type { CreatePostRequest } from "../dtos/post/CreatePostRequest.js";
import type { UpdatePostRequest } from "../dtos/post/UpdatePostRequest.js";
import type { PostResponse } from "../dtos/post/PostResponse.js";
import type { PostWithAuthorResponse } from "../dtos/post/PostWithAuthorResponse.js";
import type { CreatePostInput } from "../../../application/contracts/post/CreatePostInput.js";
import type { UpdatePostInput } from "../../../application/contracts/post/UpdatePostInput.js";
import type { PostOutput } from "../../../application/contracts/post/PostOutput.js";
import type { PostWithAuthorOutput } from "../../../application/contracts/post/PostWithAuthorOutput.js";

export function toCreatePostInput(body: CreatePostRequest): CreatePostInput {
  return {
    title: body.title,
    content: body.content
  };
}

export function toUpdatePostInput(body: UpdatePostRequest): UpdatePostInput {
  const input: UpdatePostInput = {};

  if (body.title !== undefined) {
    input.title = body.title;
  }

  if (body.content !== undefined) {
    input.content = body.content;
  }

  return input;
}

export function toPostResponse(output: PostOutput): PostResponse {
  return {
    id: output.id,
    title: output.title,
    content: output.content,
    authorId: output.authorId,
    createdAt: output.createdAt,
    updatedAt: output.updatedAt
  };
}

export function toPostWithAuthorResponse(
  output: PostWithAuthorOutput
): PostWithAuthorResponse {
  return {
    id: output.id,
    title: output.title,
    content: output.content,
    createdAt: output.createdAt.toISOString(),
    author: {
      id: output.author.id,
      username: output.author.username
    },
    likesCount: output.likesCount,
    userHasLiked: output.userHasLiked
  };
}
