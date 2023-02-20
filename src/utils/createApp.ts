import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import useragent from "express-useragent";
import blogs from "../routes/blogs-routes";
import posts from "../routes/posts-routes";
import users from "../routes/users-routes";
import auth from "../routes/auth-routes";
import comments from "../routes/comments-routes";
import { BlogsRepository } from "../repositories/blogs-repo";
import { PostsRepository } from "../repositories/posts-repo";
import { UsersRepository } from "../repositories/users-repo";
import security from "../routes/security-routes";

const blogsRepository = new BlogsRepository();
const postsRepository = new PostsRepository();
const userRepository = new UsersRepository();

const createServer = () => {
  const app = express();

  app.set("trust proxy", true);
  app.use(useragent.express());
  app.use(bodyParser.json());
  app.use(cookieParser());

  app.use("/blogs", blogs);
  app.use("/posts", posts);
  app.use("/users", users);
  app.use("/auth", auth);
  app.use("/comments", comments);
  app.use("/security", security);

  app.delete("/testing/all-data", async (req, res) => {
    await blogsRepository.removeAllBlogs();
    await postsRepository.removeAllPosts();
    await userRepository.removeAllUsers();
    res.sendStatus(204);
  });

  return app;
};

export default createServer;
