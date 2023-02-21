/* eslint-disable class-methods-use-this */
import { Router } from "express";
import { commentsController } from "../composition/comments";
import { auth } from "../middlewares/auth";

import {
  commentIdValidation,
  sendErrorsIfThereAreAny,
  commentContentValidation,
} from "../middlewares/input-validation";

// TODO remove all of the todos in code
const router = Router();

router.get("/:id", commentsController.getCommentById.bind(commentsController));

router.put(
  "/:commentId",
  [
    auth,
    commentIdValidation,
    commentContentValidation,
    sendErrorsIfThereAreAny,
  ],
  commentsController.updateCommentById.bind(commentsController)
);

router.put(
  "/:commentId/like-status",
  [auth, commentIdValidation, sendErrorsIfThereAreAny],
  commentsController.likeDislikeComment.bind(commentsController)
);

router.delete(
  "/:commentId",
  [auth, commentIdValidation, sendErrorsIfThereAreAny],
  commentsController.deleteCommentById.bind(commentsController)
);

export default router;
