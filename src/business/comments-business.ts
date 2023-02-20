/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */
import { PostsRepository } from "../repositories/posts-repo";
import PostsSchema from "../models/Posts";

// CUD only
export class CommentsBusiness {
  constructor(protected postsRepository: PostsRepository) {}

  async deleteById(id: string) {
    const result = await this.postsRepository.deleteComment(id);

    const isDeleted = result ? true : null;
    if (isDeleted) {
      return true;
    }

    return false;
  }

  async likeDislikeComment(
    likeStatus: "None" | "Like" | "Dislike",
    userId: string,
    commentId: string
  ) {
    let doc = await PostsSchema.findOne({
      comments: { $elemMatch: { _id: commentId } },
    });
    if (!doc) {
      return 404;
    }
    //TODO return 404 if this thing is not found.

    if (likeStatus === "None") {
      doc?.comments.forEach((com, i) => {
        if (com._id?.toString() === commentId) {
          // @ts-ignore
          doc?.comments[i].likes = com.likes.filter(
            (lik) => lik.userId.toString() !== userId
          );
        }
      });
    } else {
      let existingLikeDislike = false;

      doc?.comments.forEach((com, i) => {
        if (com._id?.toString() === commentId) {
          com.likes.forEach((lik, likeIndex) => {
            if (lik.userId.toString() === userId) {
              // @ts-ignore
              doc?.comments[i].likes[likeIndex].status = likeStatus;
              existingLikeDislike = true;
            }
          });

          if (!existingLikeDislike) {
            doc?.comments[i].likes.push({ status: likeStatus, userId });
          }
        }
      });
    }

    const updatedDoc = await doc.save();

    console.log(updatedDoc, "updatedDoc");
    return true;
  }

  async updateCommentById(commentId: string, content: string) {
    const result = await this.postsRepository.updateComment(commentId, content);

    if (result && result.modifiedCount === 1 && result.acknowledged) {
      return true;
    }

    return false;
  }
}

export default CommentsBusiness;
