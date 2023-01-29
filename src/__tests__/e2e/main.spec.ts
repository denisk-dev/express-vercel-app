import request from "supertest";
import { MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import createServer from "../../utils/createApp";

const app = createServer();

//1. watch 2 vidosa dimycha
//2. make sure the below routes include tests + working as expected

//TODO(others):

//comments/:commentId (Put) (implemented)
//comments/:commentId (Delete) (implemented)
//comments/:id (get)  (implemented)
// posts/:postId/comments (get)

describe("TESTING ALL BLOGS API ENDPOINT", () => {
  let con: MongoClient;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    con = await MongoClient.connect(mongoServer.getUri(), {});
  });

  afterAll(async () => {
    if (con) {
      await con.close();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  it("api/users (POST) - adding new user (401)", async () => {
    const response = await request(app)
      .post("/users")
      .set("Authorization", "Basic 123")
      .send({
        login: "decay",
        password: "den123",
        email: "krfer@re.re",
      });

    expect(response.status).toBe(401);
  });

  it("api/users (POST) - adding new user (400)", async () => {
    const response = await request(app)
      .post("/users")
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .send({
        login: "ay",
        password: "den23",
        email: "krfer@@@re.re",
      });

    expect(response.body).toEqual({
      errorsMessages: [
        { message: "Invalid value", field: "login" },
        { message: "Invalid value", field: "password" },
        { message: "Invalid value", field: "email" },
      ],
    });

    expect(response.status).toBe(400);
  });

  let userIdToDelete = "";

  it("api/users (POST) - adding another new user (201)", async () => {
    const anotherResponse = await request(app)
      .post("/users")
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .send({
        login: "denis123",
        password: "Denis1998__",
        email: "denis@gmail.re",
      });

    userIdToDelete = anotherResponse.body.id;

    expect(anotherResponse.body.login).toBe("denis123");

    expect(anotherResponse.body.email).toBe("denis@gmail.re");

    const isValidDateAnother = Date.parse(anotherResponse.body.createdAt);

    expect(isValidDateAnother).toEqual(expect.any(Number));
    expect(anotherResponse.body.id).toEqual(expect.any(String));

    expect(anotherResponse.status).toBe(201);
  });

  let loginOfAddedUser = "";
  let emailOfAddedUser = "";
  const passwordOfAddedUser = "Denis1998__";
  it("api/users (POST) - adding new user (201)", async () => {
    const response = await request(app)
      .post("/users")
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .send({
        login: "rofl123",
        password: "Denis1998__",
        email: "krfer@re.re",
      });

    loginOfAddedUser = response.body.login;

    emailOfAddedUser = response.body.email;

    expect(response.body.login).toBe("rofl123");

    expect(response.body.email).toBe("krfer@re.re");

    const isValidDate = Date.parse(response.body.createdAt);

    expect(isValidDate).toEqual(expect.any(Number));
    expect(response.body.id).toEqual(expect.any(String));

    expect(response.status).toBe(201);
  });

  it("api/users/:id (DELETE) - delete user by specified ID (401)", async () => {
    const response = await request(app).delete(`/users/${userIdToDelete}`);

    expect(response.status).toBe(401);
  });

  it("api/users/:id (DELETE) - delete user by specified ID (404)", async () => {
    const response = await request(app)
      .delete(`/users/12312312312312312321412412`)
      .set("Authorization", "Basic YWRtaW46cXdlcnR5");

    expect(response.status).toBe(404);
  });

  it("api/users/:id (DELETE) - delete user by specified ID (204)", async () => {
    const response = await request(app)
      .delete(`/users/${userIdToDelete}`)
      .set("Authorization", "Basic YWRtaW46cXdlcnR5");

    expect(response.status).toBe(204);
  });

  it("users (GET) - returns users with pagin (401)", async () => {
    const response = await request(app).get("/users");

    expect(response.status).toBe(401);
  });

  it("users (GET) - returns users with pagin (200)", async () => {
    const response = await request(app)
      .get("/users")
      .set("Authorization", "Basic YWRtaW46cXdlcnR5");

    expect(response.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [
        {
          login: "rofl123",
          email: "krfer@re.re",
          id: expect.any(String),
          createdAt: expect.any(String),
        },
      ],
    });

    expect(response.status).toBe(200);
  });

  it("auth/login (POST) - Try to login to the system (400)", async () => {
    const response = await request(app).post("/auth/login").send({
      loginOrEmail: 1,
      // loginOrEmail: loginOfAddedUser,
      // password: passwordOfAddedUser,
    });

    expect(response.body).toEqual({
      errorsMessages: [
        {
          message: "Invalid value",
          field: "loginOrEmail",
        },
        {
          message: "Invalid value",
          field: "password",
        },
      ],
    });

    expect(response.status).toBe(400);
  });

  it("auth/login (POST) - Try to login to the system (401)", async () => {
    const response = await request(app).post("/auth/login").send({
      loginOrEmail: loginOfAddedUser,
      password: "passwordOfAddedUserrofl123",
    });

    expect(response.status).toBe(401);
  });

  let accessToken = "";
  it("auth/login (POST) - Try to login to the system (200) - using EMail", async () => {
    const response = await request(app).post("/auth/login").send({
      loginOrEmail: emailOfAddedUser,
      password: passwordOfAddedUser,
    });

    accessToken = response.body.accessToken;

    expect(response.body).toEqual({
      accessToken: expect.any(String),
    });

    expect(response.status).toBe(200);
  });

  it("auth/login (POST) - Try to login to the system (200)  - using login", async () => {
    const response = await request(app).post("/auth/login").send({
      loginOrEmail: loginOfAddedUser,
      password: passwordOfAddedUser,
    });

    expect(response.body).toEqual({
      accessToken: expect.any(String),
    });

    expect(response.status).toBe(200);
  });

  it("auth/me (GET) - Get info about current user (401)", async () => {
    const response = await request(app)
      .get("/auth/me")
      .set("Authorization", "Bearer 123");

    expect(response.status).toBe(401);
  });

  const userLogin = "rofl123";
  let userId = "";
  it("auth/me (GET) - Get info about current user (200)", async () => {
    const response = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.body).toEqual({
      email: "krfer@re.re",
      login: userLogin,
      userId: expect.any(String),
    });

    userId = response.body.userId;

    expect(response.status).toBe(200);
  });

  it("api/blogs (POST) - constructing new Blog entity (401)", async () => {
    const response = await request(app)
      .post("/blogs")
      .set("Authorization", "Basic 123")
      .send({
        name: "cool new blog",
        description: "description of cool new blog",
        websiteUrl:
          "https://express-validator.github.io/docs/custom-error-messages.html",
      });

    expect(response.status).toBe(401);
  });

  it("api/blogs (POST) - If the inputModel has incorrect values (400)", async () => {
    const response = await request(app)
      .post("/blogs")
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .send({
        name: "coolsdfsdfsdfsdfnewsdfsdfsdfsdfblog",
        description: 32,
        websiteUrl: "sdf1",
      });

    expect(response.body).toEqual({
      errorsMessages: [
        { message: "Invalid value", field: "name" },
        { message: "Invalid value", field: "description" },
        { message: "Invalid value", field: "websiteUrl" },
      ],
    });

    expect(response.status).toBe(400);
  });

  let firstAddedBlog = "";
  it("api/blogs (POST) - returns newly created blog (201)", async () => {
    const response = await request(app)
      .post("/blogs")
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .send({
        name: "cool new blog",
        description: "description of cool new blog",
        websiteUrl:
          "https://express-validator.github.io/docs/custom-error-messages.html",
      });

    expect(response.body.name).toBe("cool new blog");
    expect(response.body.description).toBe("description of cool new blog");
    expect(response.body.websiteUrl).toBe(
      "https://express-validator.github.io/docs/custom-error-messages.html"
    );

    const isValidDate = Date.parse(response.body.createdAt);

    expect(isValidDate).toEqual(expect.any(Number));
    expect(response.body.id).toEqual(expect.any(String));

    firstAddedBlog = response.body.id;

    expect(response.status).toBe(201);
  });

  let addedBlog = "";
  it("api/blogs (POST) - returns second newly created blog (201)", async () => {
    const response = await request(app)
      .post("/blogs")
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .send({
        name: "blog 123",
        description: "description of cool new blog 123",
        websiteUrl:
          "https://express-rofl.github.io/docs/custom-error-messages.html",
      });

    expect(response.body.name).toBe("blog 123");
    expect(response.body.description).toBe("description of cool new blog 123");
    expect(response.body.websiteUrl).toBe(
      "https://express-rofl.github.io/docs/custom-error-messages.html"
    );

    const isValidDate = Date.parse(response.body.createdAt);

    expect(isValidDate).toEqual(expect.any(Number));
    expect(response.body.id).toEqual(expect.any(String));

    addedBlog = response.body.id;

    expect(response.status).toBe(201);
  });

  it("api/blogs (GET) - returns blogs with pagin (200)", async () => {
    const response = await request(app).get("/blogs");

    expect(response.body).toEqual({
      items: [
        {
          name: "blog 123",
          websiteUrl:
            "https://express-rofl.github.io/docs/custom-error-messages.html",
          description: "description of cool new blog 123",
          id: expect.any(String),
          createdAt: expect.any(String),
        },
        {
          name: "cool new blog",
          websiteUrl:
            "https://express-validator.github.io/docs/custom-error-messages.html",
          description: "description of cool new blog",
          id: expect.any(String),
          createdAt: expect.any(String),
        },
      ],
      totalCount: 2,
      pagesCount: 1,
      page: 1,
      pageSize: 10,
    });

    expect(response.status).toBe(200);
  });

  it("api/blogs/id (GET) - return blog by id (200)", async () => {
    const response = await request(app).get(`/blogs/${addedBlog}`);

    expect(response.body.name).toBe("blog 123");
    expect(response.body.description).toBe("description of cool new blog 123");
    expect(response.body.websiteUrl).toBe(
      "https://express-rofl.github.io/docs/custom-error-messages.html"
    );

    const isValidDate = Date.parse(response.body.createdAt);

    expect(isValidDate).toEqual(expect.any(Number));
    expect(response.body.id).toEqual(expect.any(String));

    expect(response.status).toBe(200);
  });

  it("api/blogs/id (PUT) - Update existing Blog by id (401)", async () => {
    const response = await request(app).put(`/blogs/${firstAddedBlog}`).send({
      name: "Updated name",
      description: "Updated description",
      websiteUrl: "https://rofl.github.io/docs/custom-error-messages.html",
    });

    expect(response.status).toBe(401);
  });

  it("api/blogs/id (PUT) - Update existing Blog by id (404)", async () => {
    const response = await request(app)
      .put(`/blogs/1ab79625-0d2e-479f-841f-9cbdc1fc47871111111`)
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .send({
        name: "Updated name",
        description: "Updated description",
        websiteUrl: "https://rofl.github.io/docs/custom-error-messages.html",
      });

    expect(response.status).toBe(404);
  });

  it("api/blogs/id (PUT) - Update existing Blog by id (204)", async () => {
    const response = await request(app)
      .put(`/blogs/${firstAddedBlog}`)
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .send({
        name: "Updated name",
        description: "Updated description",
        websiteUrl: "https://rofl.github.io/docs/custom-error-messages.html",
      });

    expect(response.status).toBe(204);
  });

  it("api/blogs/id (PUT) - Update existing Blog by id (400)", async () => {
    const response = await request(app)
      .put(`/blogs/${firstAddedBlog}`)
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .send({
        name: "coolsdfsdfsdfsdfnewsdfsdfsdfsdfblog",
        description: 32,
        websiteUrl: "sdf1",
      });

    expect(response.body).toEqual({
      errorsMessages: [
        { message: "Invalid value", field: "name" },
        { message: "Invalid value", field: "description" },
        { message: "Invalid value", field: "websiteUrl" },
      ],
    });

    expect(response.status).toBe(400);
  });

  it("api/blogs/id (GET) - return blog by id (200)", async () => {
    const response = await request(app).get(`/blogs/${firstAddedBlog}`);

    expect(response.body.name).toBe("Updated name");
    expect(response.body.description).toBe("Updated description");
    expect(response.body.websiteUrl).toBe(
      "https://rofl.github.io/docs/custom-error-messages.html"
    );

    const isValidDate = Date.parse(response.body.createdAt);

    expect(isValidDate).toEqual(expect.any(Number));
    expect(response.body.id).toEqual(expect.any(String));

    expect(response.status).toBe(200);
  });

  it("api/blogs/id (DELETE) - delete blog by specified ID (401)", async () => {
    const response = await request(app).delete(`/blogs/${firstAddedBlog}`);

    expect(response.status).toBe(401);
  });

  it("api/blogs/id (DELETE) - delete blog by specified ID (404)", async () => {
    const response = await request(app)
      .delete(`/blogs/12312312312312312321412412`)
      .set("Authorization", "Basic YWRtaW46cXdlcnR5");

    expect(response.status).toBe(404);
  });

  it("api/blogs/id (DELETE) - delete blog by specified ID (204)", async () => {
    const response = await request(app)
      .delete(`/blogs/${firstAddedBlog}`)
      .set("Authorization", "Basic YWRtaW46cXdlcnR5");

    expect(response.status).toBe(204);
  });

  it("api/blogs/id (GET) - return blog by id (404)", async () => {
    const response = await request(app).get(`/blogs/${firstAddedBlog}`);

    expect(response.status).toBe(404);
  });

  //--------------------------------------------
  // create new post for specific blog

  it("api/blogs/:blogId/posts (POST) - create new post for specific blog (401)", async () => {
    const response = await request(app).post(`/blogs/${addedBlog}/posts`).send({
      title: "wre1231",
      shortDescription: "sfrwer2r23233131 dsfsd fewr ",
      content: "fssfdwerwer wersdf 1231",
    });

    expect(response.status).toBe(401);
  });

  it("api/blogs/:blogId/posts (POST) - create new post for specific blog (404)", async () => {
    const response = await request(app)
      .post(`/blogs/lololololololo12/posts`)
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .send({
        title: "wre1231",
        shortDescription: "sfrwer2r23233131 dsfsd fewr ",
        content: "fssfdwerwer wersdf 1231",
      });

    expect(response.status).toBe(404);
  });

  it("api/blogs/:blogId/posts (POST) - create new post for specific blog (400)", async () => {
    const response = await request(app)
      .post(`/blogs/${addedBlog}/posts`)
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .send({
        title: "wre1231sdfgdsfgsdfgsdwrwrwerer23r23423sfsddrwer23r23r2r",
        shortDescription: 34123,
        content: 43123,
      });

    expect(response.body).toEqual({
      errorsMessages: [
        { message: "Invalid value", field: "title" },
        { message: "Invalid value", field: "shortDescription" },
        { message: "Invalid value", field: "content" },
      ],
    });

    expect(response.status).toBe(400);
  });

  it("api/blogs/:blogId/posts (POST) - create new post for specific blog (201)", async () => {
    const response = await request(app)
      .post(`/blogs/${addedBlog}/posts`)
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .send({
        title: "rofl title",
        shortDescription: "rofl title description description description",
        content: "content content content content",
      });

    expect(response.body.title).toBe("rofl title");
    expect(response.body.blogName).toBe("blog 123");
    expect(response.body.blogId).toBe(addedBlog);
    expect(response.body.shortDescription).toBe(
      "rofl title description description description"
    );
    expect(response.body.content).toBe("content content content content");

    const isValidDate = Date.parse(response.body.createdAt);

    expect(isValidDate).toEqual(expect.any(Number));
    expect(response.body.id).toEqual(expect.any(String));

    expect(response.status).toBe(201);
  });

  // // --------------------------------------------

  //--------------------------------------------
  // Return all posts for specified blog

  it("api/blogs/:blogId/posts (GET) - read all posts for specific blog (200)", async () => {
    const response = await request(app).get(`/blogs/${addedBlog}/posts`);

    expect(response.body).toEqual({
      items: [
        {
          title: "rofl title",
          shortDescription: "rofl title description description description",
          content: "content content content content",
          blogId: addedBlog,
          blogName: "blog 123",
          id: expect.any(String),
          createdAt: expect.any(String),
          comments: [],
        },
      ],
      totalCount: 1,
      pagesCount: 1,
      page: 1,
      pageSize: 10,
    });

    expect(response.status).toBe(200);
  });

  it("api/blogs/:blogId/posts (GET) - read all posts for specific blog (200)", async () => {
    const response = await request(app).get(
      `/blogs/123123looloololololo/posts`
    );

    expect(response.status).toBe(404);
  });

  // // --------------------------------------------

  it("api/posts (POST) - create new post (401)", async () => {
    const response = await request(app).post(`/posts`).send({
      title: "wre1231",
      shortDescription: "sfrwer2r23233131 dsfsd fewr ",
      content: "fssfdwerwer wersdf 1231",
      // blogId: addedBlog,
      blogId: "rofl test",
    });

    expect(response.status).toBe(401);
  });

  it("api/posts (POST) - create new post (400)", async () => {
    const response = await request(app)
      .post(`/posts`)
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .send({
        title: "wre1231sdfgdsfgsdfgsdwrwrwerer23r23423sfsddrwer23r23r2r",
        shortDescription: 34123,
        content: 43123,
        blogId: "rofl test",
      });

    expect(response.body).toEqual({
      errorsMessages: [
        { message: "Invalid value", field: "title" },
        { message: "Invalid value", field: "shortDescription" },
        { message: "Invalid value", field: "content" },
        { message: "somethiw wrong with blogId", field: "blogId" },
      ],
    });

    expect(response.status).toBe(400);
  });

  let firstAddedPostId = "";
  it("api/posts (POST) - create new post (201)", async () => {
    const response = await request(app)
      .post(`/posts`)
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .send({
        title: "rofl title",
        shortDescription: "rofl title description description description",
        content: "content content content content",
        blogId: addedBlog,
      });

    expect(response.body.title).toBe("rofl title");
    expect(response.body.blogName).toBe("blog 123");
    expect(response.body.blogId).toBe(addedBlog);
    expect(response.body.shortDescription).toBe(
      "rofl title description description description"
    );
    expect(response.body.content).toBe("content content content content");

    const isValidDate = Date.parse(response.body.createdAt);

    expect(isValidDate).toEqual(expect.any(Number));
    expect(response.body.id).toEqual(expect.any(String));

    firstAddedPostId = response.body.id;

    expect(response.status).toBe(201);
  });

  it("api/posts/id (GET) - return post by id (200)", async () => {
    const response = await request(app).get(`/posts/${firstAddedPostId}`);

    expect(response.body.title).toBe("rofl title");
    expect(response.body.blogName).toBe("blog 123");
    expect(response.body.blogId).toBe(addedBlog);
    expect(response.body.shortDescription).toBe(
      "rofl title description description description"
    );
    expect(response.body.content).toBe("content content content content");

    const isValidDate = Date.parse(response.body.createdAt);

    expect(isValidDate).toEqual(expect.any(Number));
    expect(response.body.id).toEqual(expect.any(String));

    expect(response.status).toBe(200);
  });

  it("api/posts/id (GET) - return post by id (404)", async () => {
    const response = await request(app).get(`/posts/${"rofl000000000"}`);

    expect(response.status).toBe(404);
  });

  it("api/posts/id (PUT) - Update existing post by id (401)", async () => {
    const response = await request(app).put(`/posts/${firstAddedPostId}`).send({
      title: "Updated name",
      shortDescription: "Updated description",
      content: "https://rofl.github.io/docs/custom-error-messages.html",
    });

    expect(response.status).toBe(401);
  });
  it("api/posts/id (PUT) - Update existing posts by id (404)", async () => {
    const response = await request(app)
      .put(`/posts/1ab79625-0d2e-479f-841f-9cbdc1fc47871111111`)
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .send({
        title: "rofl title",
        shortDescription: "rofl title description description description",
        content: "content content content content",
        blogId: addedBlog,
      });

    expect(response.status).toBe(404);
  });

  it("api/posts/id (PUT) - Update existing posts by id (400)", async () => {
    const response = await request(app)
      .put(`/posts/${firstAddedPostId}`)
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .send({
        title: 33123,
        shortDescription: 32,
        content: 2222,
        blogId: 12,
      });

    expect(response.body).toEqual({
      errorsMessages: [
        { message: "Invalid value", field: "title" },
        { message: "Invalid value", field: "shortDescription" },
        { message: "Invalid value", field: "content" },
        { message: "somethiw wrong with blogId", field: "blogId" },
      ],
    });

    expect(response.status).toBe(400);
  });
  it("api/posts/id (PUT) - Update existing posts by id (204)", async () => {
    const response = await request(app)
      .put(`/posts/${firstAddedPostId}`)
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .send({
        title: "updated title",
        shortDescription:
          "updated rofl title description description description",
        content: "updated content content content content",
        blogId: addedBlog,
      });

    expect(response.status).toBe(204);
  });

  let secondAddedPostIdToBeDeleted = "";
  it("api/posts (POST) - create new post (201)", async () => {
    const response = await request(app)
      .post(`/posts`)
      .set("Authorization", "Basic YWRtaW46cXdlcnR5")
      .send({
        title: "rofl title",
        shortDescription: "rofl title description description description",
        content: "content content content content",
        blogId: addedBlog,
      });

    expect(response.body.title).toBe("rofl title");
    expect(response.body.blogName).toBe("blog 123");
    expect(response.body.blogId).toBe(addedBlog);
    expect(response.body.shortDescription).toBe(
      "rofl title description description description"
    );
    expect(response.body.content).toBe("content content content content");

    const isValidDate = Date.parse(response.body.createdAt);

    expect(isValidDate).toEqual(expect.any(Number));
    expect(response.body.id).toEqual(expect.any(String));

    secondAddedPostIdToBeDeleted = response.body.id;

    expect(response.status).toBe(201);
  });

  it("api/posts/id (DELETE) - delete posts by specified ID (401)", async () => {
    const response = await request(app).delete(
      `/posts/${secondAddedPostIdToBeDeleted}`
    );

    expect(response.status).toBe(401);
  });

  it("api/posts/id (DELETE) - delete posts by specified ID (404)", async () => {
    const response = await request(app)
      .delete(`/posts/12312312312312312321412412`)
      .set("Authorization", "Basic YWRtaW46cXdlcnR5");

    expect(response.status).toBe(404);
  });

  it("api/posts/id (DELETE) - delete posts by specified ID (204)", async () => {
    const response = await request(app)
      .delete(`/posts/${secondAddedPostIdToBeDeleted}`)
      .set("Authorization", "Basic YWRtaW46cXdlcnR5");

    expect(response.status).toBe(204);
  });

  it("api/posts (GET) - returns posts with pagin (200)", async () => {
    const response = await request(app).get("/posts");

    expect(response.body).toEqual({
      items: [
        {
          title: "updated title",
          shortDescription:
            "updated rofl title description description description",
          content: "updated content content content content",
          blogId: addedBlog,
          blogName: "blog 123",
          id: expect.any(String),
          createdAt: expect.any(String),
        },
        {
          title: "rofl title",
          shortDescription: "rofl title description description description",
          content: "content content content content",
          blogId: addedBlog,
          blogName: "blog 123",
          id: expect.any(String),
          createdAt: expect.any(String),
        },
      ],
      totalCount: 2,
      pagesCount: 1,
      page: 1,
      pageSize: 10,
    });

    expect(response.status).toBe(200);
  });

  // -------------------------------
  // Create new comment
  it("api/posts/:postId/comments (POST) - create new comment (400)", async () => {
    const response = await request(app)
      .post(`/posts/${firstAddedPostId}/comments`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        content: "strin",
      });

    expect(response.body).toEqual({
      errorsMessages: [{ message: "Invalid value", field: "content" }],
    });

    expect(response.status).toBe(400);
  });

  it("api/posts/:postId/comments (POST) - create new comment (401)", async () => {
    const response = await request(app)
      .post(`/posts/${firstAddedPostId}/comments`)
      .send({
        content: "strindfsfsdfsdfsdfwerfwefsdfwefwefsd",
      });

    expect(response.status).toBe(401);
  });

  it("api/posts/:postId/comments (POST) - create new comment (404)", async () => {
    const response = await request(app)
      .post(`/posts/roflid1212121111/comments`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        content: "strindfsfsdfsdfsdfwerfwefsdfwefwefsd",
      });

    expect(response.status).toBe(404);
  });

  it("api/posts/:postId/comments (POST) - create new comment (201)", async () => {
    const response = await request(app)
      .post(`/posts/${firstAddedPostId}/comments`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        content: "stringstringstringst",
      });

    expect(response.body).toEqual({
      id: expect.any(String),
      content: "stringstringstringst",
      userId,
      userLogin,
      createdAt: expect.any(String),
    });

    expect(response.status).toBe(201);
  });

  // -------------------------------

  it("api/posts/:postId/comments (POST) - create another comment (201)", async () => {
    const response = await request(app)
      .post(`/posts/${firstAddedPostId}/comments`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        content: "stringstringstringst",
      });

    expect(response.body).toEqual({
      id: expect.any(String),
      content: "Rofl content will be here. hah ha ha ha ha ha ha h",
      userId,
      userLogin,
      createdAt: expect.any(String),
    });

    expect(response.status).toBe(201);
  });

  //update another comment

  //get updated comment

  //delete comment

  //get remaining updated comment

  // it("Clean everything", async () => {
  //   const response = await request(app).delete(`/testing/all-data`);

  //   expect(response.status).toBe(204);
  // });
});
