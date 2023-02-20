/* eslint-disable class-methods-use-this */

import { PostsRepository } from "../repositories/posts-repo";
import { InputAddPost } from "../types/types";

// CUD only
export class PostsBusiness {
  constructor(protected postsRepository: PostsRepository) {}

  async createNewComment(
    postId: string,
    content: string,
    userId: string,
    userLogin: string
  ) {
    const result = await this.postsRepository.findOneAndUpdateComment(
      postId,
      content,
      userLogin,
      userId
    );

    if (result) {
      return result.comments?.[result.comments.length - 1];
    }
    return false;
  }

  async deleteById(id: string) {
    const result = await this.postsRepository.deleteById(id);

    if (result && result.deletedCount === 0) {
      return false;
    }
    return true;
  }

  async updatePost(post: InputAddPost, id: string) {
    const result = await this.postsRepository.updatePost(post, id);

    if (result && result.matchedCount === 1) {
      return true;
    }

    return false;
  }

  async addPost(post: InputAddPost, blogName: string) {
    const newPost = {
      ...post,
      blogName,
      comments: [],
    };

    const result = await this.postsRepository.addPost(newPost);

    if (result) {
      return result;
    }

    return null;
  }
}

export default PostsBusiness;
