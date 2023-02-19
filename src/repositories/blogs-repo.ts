import BlogSchema from "../models/Blogs";
import PostsSchema from "../models/Posts";
import { InputAddBlog } from "../types/types";
import { skip, getSortBy } from "../utils/pagination";

// TODO MOVE ALL OF THE GET REQUESTS TO QUERY REPO, HERE IS CUD ONLY

export const blogsDataAccessLayer = {
  async findBlogs(
    searchNameTerm: string | null,
    pageSize: number,
    pageNumber: number,
    sortBy: string,
    sortDirection: string
  ) {
    const searchByPart = searchNameTerm
      ? { name: { $regex: searchNameTerm, $options: "i" } }
      : {};

    const sort = getSortBy(sortDirection, sortBy);

    const allValuesCount = await BlogSchema.countDocuments({
      ...searchByPart,
    });

    const limitedValues = await BlogSchema.find(searchByPart, null, {
      skip: skip(pageNumber, pageSize),
    })
      .sort(sort)
      .limit(pageSize)
      .lean();

    const pagesCount =
      allValuesCount < pageSize ? 1 : Math.ceil(allValuesCount / pageSize);

    return { items: limitedValues, totalCount: allValuesCount, pagesCount };
  },

  async getById(id: string) {
    const result = await BlogSchema.findById(id);

    if (result) {
      return result;
    }
    return false;
  },
  async getByMongoId(mongoId: string) {
    const result = await BlogSchema.findOne({ _id: mongoId }).lean();

    if (result) {
      return result;
    }
    return false;
  },

  async deleteById(id: string) {
    try {
      return await BlogSchema.deleteOne({ _id: id });
    } catch (error) {
      console.log(error);
      return null;
    }
  },

  async addBlog(blog: InputAddBlog) {
    try {
      const blogs = new BlogSchema({
        name: blog.name,
        websiteUrl: blog.websiteUrl,
        isMembership: blog.isMembership,
        description: blog.description,
      });

      const bsdf = await blogs.save();

      // eslint-disable-next-line no-underscore-dangle
      return bsdf._id.toString();
    } catch (error) {
      return null;
    }
  },

  async updateBlog(id: string, blog: InputAddBlog) {
    try {
      return await BlogSchema.updateOne(
        { _id: id },
        {
          $set: {
            ...blog,
          },
        }
      );
    } catch (error) {
      console.log(error);
      return null;
    }
  },

  async removeAllBlogs() {
    await BlogSchema.deleteMany({});
  },

  async findPostsForSpecificBlog(
    pageSize: number,
    pageNumber: number,
    sortBy: string,
    sortDirection: string,
    blogId: string
  ) {
    const sort = getSortBy(sortDirection, sortBy);

    const allValuesCount = await PostsSchema.countDocuments({ blogId });

    const allValues = await PostsSchema.find(
      { blogId },
      {
        skip: skip(pageNumber, pageSize),
      }
    )
      .sort(sort)
      .limit(pageSize)
      .lean();

    const pagesCount =
      allValuesCount < pageSize ? 1 : Math.ceil(allValuesCount / pageSize);

    return { items: allValues, totalCount: allValuesCount, pagesCount };
  },
};

export default blogsDataAccessLayer;
