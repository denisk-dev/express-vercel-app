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

  return res.send(comments);
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

    if (user.id !== post?.comments?.[0].userId) {
      return res.sendStatus(403);
    }

    const { content } = req.body;

    //TODO find the comment by user id and check if the id of coment and id of the user is not the same and send 403

    const result = await commentsBusinessLogicLayer.updateCommentById(
      commentId,
      content
    );

    if (result) {
      return res.sendStatus(204);
    }

    return res.sendStatus(404);

    // WHat to do with this result????
    // console.log(result);
    // return res.send({ todo: "TODO" });
  }
);

router.delete(
  "/:commentId",
  [auth, commentIdValidation, sendErrorsIfThereAreAny],
  async (req: Request, res: Response) => {
    const { commentId } = req.params;

    // const { user } = req.context;

    const comment = await queryRepo.getCommentById(commentId);

    // TODO what is up with this comment, figure it out!
    console.log(comment);
    const isDeleted = await commentsBusinessLogicLayer.deleteById(commentId);

    if (isDeleted) {
      return res.sendStatus(204);
    }
    return res.sendStatus(404);
  }
);

export default router;
