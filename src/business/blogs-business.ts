/* eslint-disable class-methods-use-this */
import { BlogsRepository } from "../repositories/blogs-repo";
import { InputAddBlog } from "../types/types";

// CUD only
export class BlogsBusiness {
  constructor(protected blogsRepository: BlogsRepository) {}

  async deleteById(id: string) {
    const result = await this.blogsRepository.deleteById(id);

    if (result && result.deletedCount === 0) {
      return false;
    }
    return true;
  }

  async addBlog(blog: InputAddBlog) {
    const newBlogId = await this.blogsRepository.addBlog({ ...blog });

    if (newBlogId) {
      return newBlogId;
    }

    return null;
  }

  async updateBlog(blog: InputAddBlog, id: string) {
    const result = await this.blogsRepository.updateBlog(id, blog);

    if (result && result.matchedCount === 1) {
      return true;
    }
    return false;
  }
}

export default BlogsBusiness;
