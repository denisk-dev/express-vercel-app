import { BlogsController } from "../controllers/blogs-controller";
import { BlogsRepository } from "../repositories/blogs-repo";
import { PostsRepository } from "../repositories/posts-repo";
import { BlogsBusiness } from "../business/blogs-business";
import { PostsBusiness } from "../business/posts-business";

const blogsRepository = new BlogsRepository();
const postsRepository = new PostsRepository();
const blogsBusiness = new BlogsBusiness(new BlogsRepository());
const postsBusiness = new PostsBusiness(new PostsRepository());

export const blogsController = new BlogsController(
  blogsBusiness,
  postsBusiness,
  blogsRepository,
  postsRepository
);

export default blogsController;
