/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */
import { Router } from "express";
import { postsController } from "../composition/posts";
import { auth } from "../middlewares/auth";
import { auth as authBasic } from "../middlewares/auth-basic";

import {
  validatePost,
  sendErrorsIfThereAreAny,
  validateBlogIdBody,
  validateQueryParams,
  commentContentValidation,
} from "../middlewares/input-validation";

const router = Router();

router.get(
  "/:postId/comments",
  postsController.getCommentsByPost.bind(postsController)
);

router.post(
  "/:postId/comments",
  [auth, commentContentValidation, sendErrorsIfThereAreAny],
  postsController.addCommentForPost.bind(postsController)
);

router.get(
  "/",
  [...validateQueryParams, sendErrorsIfThereAreAny],
  postsController.getPosts.bind(postsController)
);

router.post(
  "/",
  [authBasic, ...validatePost, validateBlogIdBody, sendErrorsIfThereAreAny],
  postsController.addPost.bind(postsController)
);

router.get("/:id", postsController.getPost.bind(postsController));

router.put(
  "/:id",
  [authBasic, ...validatePost, validateBlogIdBody, sendErrorsIfThereAreAny],
  postsController.updatePost.bind(postsController)
);

router.delete(
  "/:id",
  [authBasic],
  postsController.deletePost.bind(postsController)
);

export default router;
