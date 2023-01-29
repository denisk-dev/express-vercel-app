import { v4 as uuidv4 } from "uuid";
import { postsDataAccessLayer } from "../repositories/posts-repo";
import { InputAddPost } from "../types/types";

// CUD only
export const postsBusinessLogicLayer = {
  async createNewComment(
    postId: string,
    content: string,
    userId: string,
    userLogin: string
  ) {
    const newComment = {
      id: uuidv4(),
      content,
      userLogin,
      userId,
      createdAt: new Date(),
    };

    const result = await postsDataAccessLayer.findOneAndUpdateComment(
      postId,
      newComment
    );

    if (result && result.value) {
      return result.value?.comments?.[result.value.comments.length - 1];
    }
    return false;
  },

  async deleteById(id: string) {
    const result = await postsDataAccessLayer.deleteById(id);

    if (result && result.deletedCount === 0) {
      return false;
    }
    return true;
  },
  async updatePost(post: InputAddPost, id: string) {
    const result = await postsDataAccessLayer.updatePost(post, id);

    if (result && result.matchedCount === 1) {
      return true;
    }

    return false;
  },
  async addPost(post: InputAddPost, blogName: string) {
    const newPost = {
      ...post,
      blogName,
      id: uuidv4(),
      createdAt: new Date(),
      comments: [],
    };

    const result = await postsDataAccessLayer.addPost(newPost);

    if (result) {
      const { insertedId } = result;

      return insertedId;
    }

    return null;
  },
};

export default postsBusinessLogicLayer;
