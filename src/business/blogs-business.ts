import { v4 as uuidv4 } from "uuid";
import { blogsDataAccessLayer } from "../repositories/blogs-repo";
import { InputAddBlog } from "../types/types";

// CUD only
export const blogsBusinessLogicLayer = {
  async deleteById(id: string) {
    const result = await blogsDataAccessLayer.deleteById(id);

    if (result && result.deletedCount === 0) {
      return false;
    }
    return true;
  },

  async addBlog(blog: InputAddBlog) {
    const newBlog = { ...blog, id: uuidv4(), createdAt: new Date() };

    const result = await blogsDataAccessLayer.addBlog(newBlog);

    if (result) {
      const { insertedId } = result;

      return insertedId;
    }

    return null;
  },
  async updateBlog(blog: InputAddBlog, id: string) {
    const result = await blogsDataAccessLayer.updateBlog(id, blog);

    if (result && result.matchedCount === 1) {
      return true;
    }
    return false;
  },
};

export default blogsBusinessLogicLayer;
