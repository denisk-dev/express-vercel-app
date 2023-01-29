import { Router, Request, Response } from "express";
import { auth } from "../middlewares/auth-basic";

import {
  validateBlog,
  sendErrorsIfThereAreAny,
  validatePost,
  validateQueryParams,
  validateBlogIdParam,
} from "../middlewares/input-validation";

import { blogsDataAccessLayer } from "../repositories/blogs-repo";
import { postsDataAccessLayer } from "../repositories/posts-repo";
import { blogsBusinessLogicLayer } from "../business/blogs-business";
import { postsBusinessLogicLayer } from "../business/posts-business";

const router = Router();

// TODO move all the logic to BUSINESS LAYER LIKE FINDING AFTER ADDING/UPDATING! УКАЗАНИЯ ДИМЫЧА

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

    const result = await blogsDataAccessLayer.findBlogs(
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
  [auth, ...validateBlog, sendErrorsIfThereAreAny],
  async (
    req: Request<
      {},
      {},
      { name: string; description: string; websiteUrl: string }
    >,
    res: Response
  ) => {
    const { name, description, websiteUrl } = req.body;

    const newlyAddedId = await blogsBusinessLogicLayer.addBlog({
      name,
      websiteUrl,
      description,
    });

    if (newlyAddedId) {
      // TODO maybe this should be in the Business layer???
      const blog = await blogsDataAccessLayer.getByMongoId(newlyAddedId);

      return res.status(201).send(blog);
    }

    return res.sendStatus(500);
  }
);

router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  const blog = await blogsDataAccessLayer.getById(id);

  if (blog) {
    res.send(blog);
  } else {
    res.sendStatus(404);
  }
});

router.put(
  "/:id",
  [auth, ...validateBlog, sendErrorsIfThereAreAny],
  async (req: Request, res: Response) => {
    const { name, description, websiteUrl } = req.body;
    const { id } = req.params;

    const isUpdated = await blogsBusinessLogicLayer.updateBlog(
      { name, description, websiteUrl },
      id
    );

    if (isUpdated) {
      res.sendStatus(204);
    } else {
      res.sendStatus(404);
    }
  }
);

router.delete("/:id", [auth], async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await blogsBusinessLogicLayer.deleteById(id);

  if (result) {
    return res.sendStatus(204);
  }
  return res.sendStatus(404);
});

router.get(
  "/:blogId/posts",
  [...validateQueryParams, validateBlogIdParam, sendErrorsIfThereAreAny],
  async (req: Request, res: Response) => {
    const { blogId } = req.params;

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

    const result = await blogsDataAccessLayer.findPostsForSpecificBlog(
      Number(pageSize),
      Number(pageNumber),
      sortBy as string,
      sortDirection as string,
      blogId
    );

    if (result.items.length === 0) {
      return res.sendStatus(404);
    }

    return res.status(200).send({
      ...result,
      page: pageNumber,
      pageSize,
    });
  }
);

router.post(
  "/:blogId/posts",
  [auth, ...validatePost, validateBlogIdParam, sendErrorsIfThereAreAny],
  async (req: Request, res: Response) => {
    const { blogId } = req.params;

    const { title, shortDescription, content } = req.body;

    // should be in business layer
    const blog = await blogsDataAccessLayer.getById(blogId);

    if (blog) {
      const newlyAddedId = await postsBusinessLogicLayer.addPost(
        { title, shortDescription, content, blogId: blog.id },
        blog.name
      );

      if (newlyAddedId) {
        const post = await postsDataAccessLayer.getByMongoId(newlyAddedId);

        return res.status(201).send(post);
      }

      res.sendStatus(500);
    }

    return res.sendStatus(404);
  }
);

export default router;
