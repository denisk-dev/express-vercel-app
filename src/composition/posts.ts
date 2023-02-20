import { PostsController } from "../controllers/posts-controller";
import { BlogsRepository } from "../repositories/blogs-repo";
import { PostsRepository } from "../repositories/posts-repo";

import { PostsBusiness } from "../business/posts-business";
import { QueryRepository } from "../repositories/query-repo";

const postsBusiness = new PostsBusiness(new PostsRepository());

export const postsController = new PostsController(
  new QueryRepository(),
  postsBusiness,
  new BlogsRepository(),
  new PostsRepository()
);

export default postsController;
