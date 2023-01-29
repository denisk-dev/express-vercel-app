export type Blogs = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
};

export type InputAddBlog = {
  name: string;
  websiteUrl: string;
  description: string;
};

export type InputAddPost = {
  blogId: string;
  content: string;
  title: string;
  shortDescription: string;
};

type Comments = {
  content: string;
  userLogin: string;
  userId: string;
  createdAt: Date;
  id: string;
};

export type Posts = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  comments: Array<Comments>;
};

export type TUsers = {
  login: string;
  password: string;
  email: string;
  createdAt: Date;
  id: string;
};
