/* eslint-disable class-methods-use-this */
import { Router } from "express";
import { auth } from "../middlewares/auth-basic";
import {
  validateBlog,
  sendErrorsIfThereAreAny,
  validatePost,
  validateQueryParams,
  validateBlogIdParam,
} from "../middlewares/input-validation";
import { blogsController } from "../composition/blogs";

const router = Router();

// TODO move all the logic to BUSINESS LAYER LIKE FINDING AFTER ADDING/UPDATING! УКАЗАНИЯ ДИМЫЧА

router.get(
  "/",
  [...validateQueryParams, sendErrorsIfThereAreAny],
  blogsController.getBlogs.bind(blogsController)
);

router.post(
  "/",
  [auth, ...validateBlog, sendErrorsIfThereAreAny],
  blogsController.addBlog.bind(blogsController)
);

router.get("/:id", blogsController.getBlog.bind(blogsController));

router.put(
  "/:id",
  [auth, ...validateBlog, sendErrorsIfThereAreAny],
  blogsController.updateBlog.bind(blogsController)
);

router.delete("/:id", [auth], blogsController.deleteBlog.bind(blogsController));

router.get(
  "/:blogId/posts",
  [...validateQueryParams, validateBlogIdParam, sendErrorsIfThereAreAny],
  blogsController.getPostsByBlogId.bind(blogsController)
);

router.post(
  "/:blogId/posts",
  [auth, ...validatePost, validateBlogIdParam, sendErrorsIfThereAreAny],
  blogsController.addPostToBlog.bind(blogsController)
);

export default router;
