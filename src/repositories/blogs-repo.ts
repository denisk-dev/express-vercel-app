import { ObjectId } from "mongodb";
import { blogsCollection, postsCollection } from "../db/db";
import { Blogs, InputAddBlog } from "../types/types";

const projection = {
  id: 1,
  name: 1,
  websiteUrl: 1,
  description: 1,
  createdAt: 1,
  _id: 0,
};

//TODO MOVE ALL OF THE GET REQUESTS TO QUERY REPO, HERE IS CUD ONLY

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

    const sort: any = {};
    if (sortBy && sortDirection) {
      sort[sortBy] = sortDirection === "desc" ? -1 : 1;
    }

    const skip = pageNumber > 0 ? (pageNumber - 1) * pageSize : 0;

    const allValuesCount = await blogsCollection.countDocuments({
      ...searchByPart,
    });

    const cursor = blogsCollection
      .find(searchByPart, { sort, skip, projection })
      .limit(pageSize);

    const limitedValues = (await cursor.toArray()) as Array<Blogs>;

    const pagesCount =
      allValuesCount < pageSize ? 1 : Math.ceil(allValuesCount / pageSize);

    return { items: limitedValues, totalCount: allValuesCount, pagesCount };
  },

  async getById(id: string): Promise<false | Blogs> {
    const result = await blogsCollection.findOne({ id }, { projection });

    if (result) {
      return result;
    }
    return false;
  },
  async getByMongoId(mongoId: ObjectId) {
    const result = await blogsCollection.findOne(
      { _id: mongoId },
      { projection }
    );

    if (result) {
      return result;
    }
    return false;
  },

  async deleteById(id: string) {
    try {
      return await blogsCollection.deleteOne({ id });
    } catch (error) {
      console.log(error);
      return null;
    }
  },

  // TODO come up with the type.
  async addBlog(blog: Blogs) {
    try {
      return await blogsCollection.insertOne(blog);
    } catch (error) {
      console.log(error);
      return null;
    }
  },

  async updateBlog(id: string, blog: InputAddBlog) {
    try {
      return await blogsCollection.updateOne(
        { id },
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
    await blogsCollection.deleteMany({});
  },

  async findPostsForSpecificBlog(
    pageSize: number,
    pageNumber: number,
    sortBy: string,
    sortDirection: string,
    blogId: string
  ) {
    // TODO check if sorting is working as expected
    const sort: any = {};
    if (sortBy && sortDirection) {
      sort[sortBy] = sortDirection === "desc" ? -1 : 1;
    }

    const skip = pageNumber > 0 ? (pageNumber - 1) * pageSize : 0;

    const allValuesArr = await postsCollection.find({ blogId }).toArray();

    const allValuesCount = allValuesArr.length;

    // TODO I think this way is better
    // const allValuesCount = await blogsCollection.countDocuments({
    //   blogId
    // });

    const allValues = await postsCollection
      .find({ blogId }, { sort, skip, projection: { _id: 0, comments: 0 } })
      .limit(pageSize)
      .toArray();

    const pagesCount =
      allValuesCount < pageSize ? 1 : Math.ceil(allValuesCount / pageSize);

    return { items: allValues, totalCount: allValuesCount, pagesCount };
  },
};

export default blogsDataAccessLayer;
