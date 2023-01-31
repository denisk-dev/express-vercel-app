import express from "express";
import bodyParser from "body-parser";
import blogs from "../routes/blogs-routes";
import posts from "../routes/posts-routes";
import users from "../routes/users-routes";
import auth from "../routes/auth-routes";
import comments from "../routes/comments-routes";
import { blogsDataAccessLayer } from "../repositories/blogs-repo";
import { postsDataAccessLayer } from "../repositories/posts-repo";
import { usersDataAccessLayer } from "../repositories/users-repo";

const createServer = () => {
  const app = express();

  app.use(bodyParser.json());

  app.use("/blogs", blogs);
  app.use("/posts", posts);
  app.use("/users", users);
  app.use("/auth", auth);
  app.use("/comments", comments);

  app.delete("/testing/all-data", async (req, res) => {
    await blogsDataAccessLayer.removeAllBlogs();
    await postsDataAccessLayer.removeAllPosts();
    await usersDataAccessLayer.removeAllUsers();
    res.sendStatus(204);
  });

  return app;
};

export default createServer;
