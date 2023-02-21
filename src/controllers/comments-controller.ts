/* eslint-disable no-underscore-dangle */
import { Request, Response } from "express";
import { CommentsBusiness } from "../business/comments-business";
import { QueryRepository } from "../repositories/query-repo";

export class CommentsController {
  constructor(
    protected commentsBusiness: CommentsBusiness,
    protected queryRepository: QueryRepository
  ) {}

  async likeDislikeComment(req: Request, res: Response) {
    const { commentId } = req.params;

    const { likeStatus } = req.body;

    const { user } = req.context;

    if (
      likeStatus !== "None" &&
      likeStatus !== "Like" &&
      likeStatus !== "Dislike"
    ) {
      return res.status(400).send({
        errorsMessages: [
          {
            message: "Invalid like status",
            field: "likeStatus",
          },
        ],
      });
    }

    // TODO will return 404 inside
    // const post = await this.queryRepository.getCommentById(commentId);

    // if (!post) {
    //   return res.sendStatus(404);
    // }

    const result = await this.commentsBusiness.likeDislikeComment(
      likeStatus,
      user._id?.toString(),
      commentId
    );
    if (result === 404) {
      return res.sendStatus(404);
    }

    return res.sendStatus(204);
  }

  async getCommentById(req: Request, res: Response) {
    const { id } = req.params;

    const { user } = req.context;

    const result = await this.queryRepository.getCommentById(id);

    // console.log(result, "result");

    if (!result) {
      return res.sendStatus(404);
    }

    const comment = result?.[0].comments;

    const totalLikes = comment.likes.filter(
      (lik: any) => lik.status === "Like"
    );
    const totalDislikes = comment.likes.filter(
      (lik: any) => lik.status === "Dislike"
    );

    // console.log(comment.likes, "likes");

    return res.send({
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: totalLikes.length,
        dislikesCount: totalDislikes.length,
        myStatus: "None",
      },
    });
  }

  async updateCommentById(req: Request, res: Response) {
    const { commentId } = req.params;

    const { user } = req.context;

    const resultComments = await this.queryRepository.getCommentById(commentId);

    if (!resultComments) {
      return res.sendStatus(404);
    }

    const comment = resultComments?.[0].comments;

    // eslint-disable-next-line no-underscore-dangle
    if (user._id?.toString() !== comment.commentatorInfo.userId.toString()) {
      return res.sendStatus(403);
    }

    const { content } = req.body;

    const result = await this.commentsBusiness.updateCommentById(
      commentId,
      content
    );

    if (result) {
      return res.sendStatus(204);
    }

    return res.sendStatus(404);
  }

  async deleteCommentById(req: Request, res: Response) {
    const { commentId } = req.params;

    const { user } = req.context;

    const result = await this.queryRepository.getCommentById(commentId);

    if (!result) {
      return res.sendStatus(404);
    }

    const comment = result?.[0].comments;

    // eslint-disable-next-line no-underscore-dangle
    if (user._id?.toString() !== comment.commentatorInfo.userId.toString()) {
      return res.sendStatus(403);
    }

    const isDeleted = await this.commentsBusiness.deleteById(commentId);

    if (isDeleted) {
      return res.sendStatus(204);
    }
    return res.sendStatus(404);
  }
}

export default CommentsController;
