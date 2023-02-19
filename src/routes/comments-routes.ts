import { Router, Request, Response } from "express";
import { commentsBusinessLogicLayer } from "../business/comments-business";
import { auth } from "../middlewares/auth";
import { queryRepo } from "../repositories/query-repo";
import {
  commentIdValidation,
  sendErrorsIfThereAreAny,
  commentContentValidation,
} from "../middlewares/input-validation";

// TODO remove all of the todos in code
const router = Router();

router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await queryRepo.getCommentById(id);

  if (!result) {
    return res.sendStatus(404);
  }

  const comments = result?.comments?.[0];

  return res.send({
    id: comments.id,
    content: comments.content,
    commentatorInfo: {
      userId: comments.commentatorInfo.userId,
      userLogin: comments.commentatorInfo.userLogin,
    },
    createdAt: comments.createdAt,
  });
});

router.put(
  "/:commentId",
  [
    auth,
    commentIdValidation,
    commentContentValidation,
    sendErrorsIfThereAreAny,
  ],
  async (req: Request, res: Response) => {
    const { commentId } = req.params;

    const { user } = req.context;

    const post = await queryRepo.getCommentById(commentId);

    if (!post) {
      return res.sendStatus(404);
    }

    // eslint-disable-next-line no-underscore-dangle
    if (user._id?.toString() !== post?.comments?.[0].commentatorInfo.userId) {
      return res.sendStatus(403);
    }

    const { content } = req.body;

    const result = await commentsBusinessLogicLayer.updateCommentById(
      commentId,
      content
    );

    if (result) {
      return res.sendStatus(204);
    }

    return res.sendStatus(404);
  }
);

router.delete(
  "/:commentId",
  [auth, commentIdValidation, sendErrorsIfThereAreAny],
  async (req: Request, res: Response) => {
    const { commentId } = req.params;

    const { user } = req.context;

    const post = await queryRepo.getCommentById(commentId);

    if (!post) {
      return res.sendStatus(404);
    }

    // eslint-disable-next-line no-underscore-dangle
    if (user._id?.toString() !== post?.comments?.[0].commentatorInfo.userId) {
      return res.sendStatus(403);
    }

    const isDeleted = await commentsBusinessLogicLayer.deleteById(commentId);

    if (isDeleted) {
      return res.sendStatus(204);
    }
    return res.sendStatus(404);
  }
);

export default router;
