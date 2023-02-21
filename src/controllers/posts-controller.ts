/* eslint-disable no-underscore-dangle */
import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { PostsRepository } from "../repositories/posts-repo";
import { BlogsRepository } from "../repositories/blogs-repo";
import { PostsBusiness } from "../business/posts-business";
import { QueryRepository } from "../repositories/query-repo";

export class PostsController {
  constructor(
    protected queryRepository: QueryRepository,
    protected postsBusiness: PostsBusiness,
    protected blogsRepository: BlogsRepository,
    protected postsRepository: PostsRepository
  ) {}

  async getCommentsByPost(req: Request, res: Response) {
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

    const result = await this.queryRepository.getCommentsForSpecifiedPost(
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
  }

  async addCommentForPost(req: Request, res: Response) {
    const { postId } = req.params;

    const { content } = req.body;

    const { user } = req.context;

    if (!user._id) {
      return res.sendStatus(404);
    }

    const result = await this.postsBusiness.createNewComment(
      postId,
      content,
      user._id?.toString(),
      user.accountData.userName
    );

    if (result) {
      const totalLikes = result.likes.filter(
        (lik: any) => lik.status === "Like"
      );
      const totalDislikes = result.likes.filter(
        (lik: any) => lik.status === "Dislike"
      );

      const myStatus = result.likes.filter(
        (lik: any) => lik.userId === user._id?.toString()
      );

      return res.status(201).send({
        id: result.id,
        content: result.content,
        commentatorInfo: {
          userId: result.commentatorInfo.userId,
          userLogin: result.commentatorInfo.userLogin,
        },
        createdAt: result.createdAt,
        likesInfo: {
          likesCount: totalLikes.length,
          dislikesCount: totalDislikes.length,
          myStatus: myStatus.length === 0 ? "None" : myStatus[0].status,
        },
      });
    }

    return res.sendStatus(404);
  }

  async getPosts(req: Request, res: Response) {
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

    const result = await this.postsRepository.findPosts(
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

  async addPost(req: Request, res: Response) {
    const { title, shortDescription, content, blogId } = req.body;

    const existingBlog = await this.blogsRepository.getById(blogId);

    if (existingBlog) {
      const { name } = existingBlog;

      const newlyAdded = await this.postsBusiness.addPost(
        {
          title,
          shortDescription,
          content,
          blogId,
        },
        name
      );

      if (newlyAdded) {
        res
          .status(201)
          .send({ id: newlyAdded._id, ...newlyAdded.toJSON(), _id: undefined });
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

  async getPost(req: Request, res: Response) {
    const { id } = req.params;

    const post = await this.postsRepository.getById(id);

    if (post) {
      res.send(post);
    } else {
      res.sendStatus(404);
    }
  }

  async updatePost(req: Request, res: Response) {
    const { title, shortDescription, content, blogId } = req.body;
    const { id } = req.params;

    const existingBlog = await this.blogsRepository.getById(blogId);

    if (existingBlog) {
      const isUpdated = await this.postsBusiness.updatePost(
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

  async deletePost(req: Request, res: Response) {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.sendStatus(404);
    }

    const result = await this.postsBusiness.deleteById(id);

    if (result) {
      return res.sendStatus(204);
    }

    return res.sendStatus(404);
  }
}

export default PostsController;
