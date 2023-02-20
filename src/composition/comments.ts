import { CommentsController } from "../controllers/comments-controller";
import { CommentsBusiness } from "../business/comments-business";
import { QueryRepository } from "../repositories/query-repo";

import { PostsRepository } from "../repositories/posts-repo";

const postsRepository = new PostsRepository();

const queryRepository = new QueryRepository();

const commentsBusiness = new CommentsBusiness(postsRepository);

// const authBusiness = new AuthBusiness(queryRepository, usersRepository);

export const commentsController = new CommentsController(
  commentsBusiness,
  queryRepository
);

export default commentsController;
