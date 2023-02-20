/* eslint-disable class-methods-use-this */
import { InputAddPost } from "../types/types";
import { skip, getSortBy } from "../utils/pagination";
import PostsSchema from "../models/Posts";

// TODO add eslint, why is not getting highlighted?????

export class PostsRepository {
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

    const sort = getSortBy(sortDirection, sortBy);

    const allValuesCount = await PostsSchema.countDocuments({
      ...searchByPart,
    });

    const limitedValues = await PostsSchema.find(searchByPart, null, {
      skip: skip(pageNumber, pageSize),
    })
      .sort(sort)
      .limit(pageSize)
      .lean();

    const pagesCount =
      allValuesCount < pageSize ? 1 : Math.ceil(allValuesCount / pageSize);

    return { items: limitedValues, totalCount: allValuesCount, pagesCount };
  }

  async getById(id: string) {
    try {
      const result = await PostsSchema.findById(id);

      if (result) {
        return result;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  async getByMongoId(mongoId: string) {
    const result = await PostsSchema.findOne({ _id: mongoId });

    if (result) {
      return result;
    }
    return false;
  }

  async deleteById(id: string) {
    try {
      return await PostsSchema.deleteOne({ _id: id });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async addPost(newPost: any) {
    try {
      return await PostsSchema.create(newPost);
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async findOneAndUpdateComment(
    postId: string,
    content: string,
    userLogin: string,
    userId: string
  ) {
    try {
      return await PostsSchema.findByIdAndUpdate(
        { _id: postId },
        {
          $push: {
            comments: { commentatorInfo: { userLogin, userId }, content },
          },
        },
        { returnDocument: "after" }
      );
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async updatePost(post: InputAddPost, id: string) {
    try {
      return await PostsSchema.updateOne(
        { _id: id },
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
  }

  async removeAllPosts() {
    await PostsSchema.deleteMany({});
  }

  async deleteComment(id: string) {
    try {
      return await PostsSchema.findOneAndUpdate(
        { comments: { $elemMatch: { _id: id } } },
        { $pull: { comments: { _id: id } } },
        { returnDocument: "after" }
      );
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async updateComment(id: string, content: string) {
    try {
      return await PostsSchema.updateOne(
        { comments: { $elemMatch: { _id: id } } },
        { $set: { "comments.$.content": content } }
        // { returnDocument: "after" }
      );
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

export default PostsRepository;
