/* eslint-disable no-underscore-dangle */
import { Router, Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { auth } from "../middlewares/auth";
import { auth as authBasic } from "../middlewares/auth-basic";
import { postsDataAccessLayer } from "../repositories/posts-repo";
import { blogsDataAccessLayer } from "../repositories/blogs-repo";
import { postsBusinessLogicLayer } from "../business/posts-business";
import { queryRepo } from "../repositories/query-repo";

import {
  validatePost,
  sendErrorsIfThereAreAny,
  validateBlogIdBody,
  validateQueryParams,
  commentContentValidation,
} from "../middlewares/input-validation";

const router = Router();

router.get("/:postId/comments", async (req: Request, res: Response) => {
  const { postId } = req.params;

  let {
    pageSize = 10,
    pageNumber = 1,
    sortBy = "createdAt",
    sortDirection = "desc",
  } = req.query;

  pageSize = pageSize ? Number(pageSize) : 10;
  pageNumber = pageNumber ? Number(pageNumber) : 1;
  sortBy = sortBy || "createdAt";
  sortDirection = sortDirection || "desc";

  const result = await queryRepo.getCommentsForSpecifiedPost(
    postId,
    Number(pageSize),
    Number(pageNumber),
    sortBy as string,
    sortDirection as string
  );

  if (result.items.length > 0) {
    res.send({
      ...result,
      page: pageNumber,
      pageSize,
    });
  } else {
    res.sendStatus(404);
  }
});

router.post(
  "/:postId/comments",
  [auth, commentContentValidation, sendErrorsIfThereAreAny],
  async (req: Request, res: Response) => {
    const { postId } = req.params;

    const { content } = req.body;

    const { user } = req.context;

    if (!user._id) {
      return res.sendStatus(404);
    }

    const result = await postsBusinessLogicLayer.createNewComment(
      postId,
      content,
      user._id?.toString(),
      user.accountData.userName
    );

    if (result) {
      return res.status(201).send({
        id: result.id,
        content: result.content,
        commentatorInfo: {
          userId: result.commentatorInfo.userId,
          userLogin: result.commentatorInfo.userLogin,
        },
        createdAt: result.createdAt,
      });
    }

    return res.sendStatus(404);
  }
);

router.get(
  "/",
  [...validateQueryParams, sendErrorsIfThereAreAny],
  async (req: Request, res: Response) => {
    let {
      pageSize = 10,
      pageNumber = 1,
      sortBy = "createdAt",
      sortDirection = "desc",
      searchNameTerm = null,
    } = req.query;

    pageSize = pageSize ? Number(pageSize) : 10;
    pageNumber = pageNumber ? Number(pageNumber) : 1;
    sortBy = sortBy || "createdAt";
    sortDirection = sortDirection || "desc";
    searchNameTerm = searchNameTerm || null;

    const result = await postsDataAccessLayer.findPosts(
      searchNameTerm as string | null,
      Number(pageSize),
      Number(pageNumber),
      sortBy as string,
      sortDirection as string
    );

    if (result.items.length === 0) {
      return res.sendStatus(404);
    }
    return res.send({
      ...result,
      page: pageNumber,
      pageSize,
    });
  }
);

router.post(
  "/",
  [authBasic, ...validatePost, validateBlogIdBody, sendErrorsIfThereAreAny],
  async (req: Request, res: Response) => {
    const { title, shortDescription, content, blogId } = req.body;

    const existingBlog = await blogsDataAccessLayer.getById(blogId);

    if (existingBlog) {
      const { name } = existingBlog;

      const newlyAdded = await postsBusinessLogicLayer.addPost(
        {
          title,
          shortDescription,
          content,
          blogId,
        },
        name
      );

      if (newlyAdded) {
        res.status(201).send(newlyAdded);
      }
    } else {
      res.status(400).send({
        errorsMessages: [
          {
            message: "string",
            field: "blogId",
          },
        ],
      });
    }
  }
);

router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  const post = await postsDataAccessLayer.getById(id);

  if (post) {
    res.send(post);
  } else {
    res.sendStatus(404);
  }
});

router.put(
  "/:id",
  [authBasic, ...validatePost, validateBlogIdBody, sendErrorsIfThereAreAny],
  async (req: Request, res: Response) => {
    const { title, shortDescription, content, blogId } = req.body;
    const { id } = req.params;

    const existingBlog = await blogsDataAccessLayer.getById(blogId);

    if (existingBlog) {
      const isUpdated = await postsBusinessLogicLayer.updatePost(
        { title, shortDescription, content, blogId },
        id
      );

      if (isUpdated) {
        res.sendStatus(204);
      } else {
        res.sendStatus(404);
      }
    } else {
      res.status(400).send({
        errorsMessages: [
          {
            message: "string",
            field: "blogId",
          },
        ],
      });
    }
  }
);

router.delete("/:id", [authBasic], async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.sendStatus(404);
  }

  const result = await postsBusinessLogicLayer.deleteById(id);

  if (result) {
    return res.sendStatus(204);
  }

  return res.sendStatus(404);
});

export default router;
