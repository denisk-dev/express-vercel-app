import { postsDataAccessLayer } from "../repositories/posts-repo";

// CUD only
export const commentsBusinessLogicLayer = {
  async deleteById(id: string) {
    const result = await postsDataAccessLayer.deleteComment(id);

    const isDeleted = result ? true : null;
    if (isDeleted) {
      return true;
    }

    return false;
  },

  async updateCommentById(commentId: string, content: string) {
    const result = await postsDataAccessLayer.updateComment(commentId, content);

    if (result && result.modifiedCount === 1 && result.acknowledged) {
      return true;
    }

    return false;
  },
};

export default commentsBusinessLogicLayer;
