/* eslint-disable no-underscore-dangle */
import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { BlogsRepository } from "../repositories/blogs-repo";
import { PostsRepository } from "../repositories/posts-repo";
import { BlogsBusiness } from "../business/blogs-business";
import { PostsBusiness } from "../business/posts-business";

export class BlogsController {
  constructor(
    protected blogsBusiness: BlogsBusiness,
    protected postsBusiness: PostsBusiness,
    protected blogsRepository: BlogsRepository,
    protected postsRepository: PostsRepository
  ) {}

  async getBlogs(req: Request, res: Response) {
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

    const result = await this.blogsRepository.findBlogs(
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

  async addBlog(
    req: Request<
      {},
      {},
      { name: string; description: string; websiteUrl: string }
    >,
    res: Response
  ) {
    const { name, description, websiteUrl } = req.body;

    const newlyAddedId = await this.blogsBusiness.addBlog({
      name,
      websiteUrl,
      description,
    });

    if (newlyAddedId) {
      // TODO maybe this should be in the Business layer???
      const blog = await this.blogsRepository.getByMongoId(newlyAddedId);

      if (blog) {
        return res.status(201).send({ id: blog._id, ...blog, _id: undefined });
      }
      return res.sendStatus(500);
    }

    return res.sendStatus(500);
  }

  async getBlog(req: Request, res: Response) {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.sendStatus(404);
    }

    const blog = await this.blogsRepository.getById(id);

    if (blog) {
      return res.send(blog);
    }
    return res.sendStatus(404);
  }

  async updateBlog(req: Request, res: Response) {
    const { name, description, websiteUrl } = req.body;
    const { id } = req.params;

    const isUpdated = await this.blogsBusiness.updateBlog(
      { name, description, websiteUrl },
      id
    );

    if (isUpdated) {
      res.sendStatus(204);
    } else {
      res.sendStatus(404);
    }
  }

  async deleteBlog(req: Request, res: Response) {
    const { id } = req.params;

    const result = await this.blogsBusiness.deleteById(id);

    if (result) {
      return res.sendStatus(204);
    }
    return res.sendStatus(404);
  }

  async getPostsByBlogId(req: Request, res: Response) {
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

    const result = await this.blogsRepository.findPostsForSpecificBlog(
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

  async addPostToBlog(req: Request, res: Response) {
    const { blogId } = req.params;

    const { title, shortDescription, content } = req.body;

    // should be in business layer
    const blog = await this.blogsRepository.getById(blogId);

    if (blog) {
      const newlyAddedId = await this.postsBusiness.addPost(
        { title, shortDescription, content, blogId: blog.id },
        blog.name
      );

      if (newlyAddedId) {
        const post = await this.postsRepository.getByMongoId(
          // eslint-disable-next-line no-underscore-dangle
          newlyAddedId._id.toString()
        );

        return res.status(201).send(post);
      }

      res.sendStatus(500);
    }

    return res.sendStatus(404);
  }
}

export default BlogsController;
