import { ObjectId } from "mongodb";
import { postsCollection } from "../db/db";
import { Posts, InputAddPost } from "../types/types";

// TODO add eslint, why is not getting highlighted?????

const projection = {
  id: 1,
  title: 1,
  shortDescription: 1,
  content: 1,
  blogId: 1,
  blogName: 1,
  createdAt: 1,
  _id: 0,
};

export const postsDataAccessLayer = {
  async findPosts(
    searchNameTerm: string | null,
    pageSize: number,
    pageNumber: number,
    sortBy: string,
    sortDirection: string
  ) {
    const searchByPart = searchNameTerm
      ? { blogName: { $regex: searchNameTerm, $options: "i" } }
      : {};

    const sort: any = {};
    if (sortBy && sortDirection) {
      sort[sortBy] = sortDirection === "desc" ? -1 : 1;
    }

    const skip = pageNumber > 0 ? (pageNumber - 1) * pageSize : 0;

    const allValuesCount = await postsCollection.countDocuments({
      ...searchByPart,
    });

    // TODO add ESLINT!!!!
    const limitedValues = await postsCollection
      .find(searchByPart, { projection, sort, skip })
      .limit(pageSize)
      .toArray();

    const pagesCount =
      allValuesCount < pageSize ? 1 : Math.ceil(allValuesCount / pageSize);

    return { items: limitedValues, totalCount: allValuesCount, pagesCount };
  },

  async getById(id: string) {
    const result = await postsCollection.findOne({ id }, { projection });

    if (result) {
      return result;
    }
    return false;
  },
  async getByMongoId(mongoId: ObjectId) {
    const result = await postsCollection.findOne(
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
      return await postsCollection.deleteOne({ id });
    } catch (error) {
      console.log(error);
      return null;
    }
  },

  async addPost(newPost: Posts) {
    try {
      return await postsCollection.insertOne(newPost);
    } catch (error) {
      console.log(error);
      return null;
    }
  },

  async findOneAndUpdateComment(
    postId: string,
    newComment: {
      content: string;
      userLogin: string;
      userId: string;
      createdAt: Date;
      id: string;
    }
  ) {
    try {
      return await postsCollection.findOneAndUpdate(
        { id: postId },
        { $push: { comments: newComment } },
        { returnDocument: "after" }
      );
    } catch (error) {
      console.log(error);
      return null;
    }
  },

  async updatePost(post: InputAddPost, id: string) {
    try {
      return await postsCollection.updateOne(
        { id },
        {
          $set: {
            ...post,
          },
        }
      );
    } catch (error) {
      console.log(error);
      return null;
    }
  },

  async removeAllPosts() {
    await postsCollection.deleteMany({});
  },

  async deleteComment(id: string) {
    try {
      return await postsCollection.findOneAndUpdate(
        { comments: { $elemMatch: { id } } },
        { $pull: { comments: { id } } }
        // { returnDocument: "after" }
      );
    } catch (error) {
      console.log(error);
      return null;
    }
  },

  async updateComment(id: string, content: string) {
    try {
      return await postsCollection.updateOne(
        { comments: { $elemMatch: { id } } },
        { $set: { "comments.$.content": content } }
        // { returnDocument: "after" }
      );
    } catch (error) {
      console.log(error);
      return null;
    }
  },
};

export default postsDataAccessLayer;
