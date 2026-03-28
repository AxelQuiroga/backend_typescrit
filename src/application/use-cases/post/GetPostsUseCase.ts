import type { PostRepository } from "../../../domain/repositories/PostRepository.js";
import type { PostWithAuthorDTO } from "../../dtos/PostWithAuthorDTO.js";

export class GetPostsUseCase {
  constructor(private postRepository: PostRepository) {}
  
  async execute(page: number, limit: number) {
    return this.postRepository.findAll(page, limit);
  }
}