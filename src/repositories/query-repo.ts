import { ObjectId } from "mongodb";
import { usersCollection, postsCollection } from "../db/db";

// TODO read only stuff are supposed to be here

// The types for Output data will be stored here.
// Use the mapper to map DB response to expected Output model for Presentation Layer

// ANOTHER TODO

// notes from lesson 3
// IDEALLY WHEN WE ADD,UPDATE blogs/posts, the verification that something exists(first get request)
// WILL NEED TO HAPPEN IN THE BUSINESS LAYER, NOT IN THE PRESENTATION LAYER(Create, Update, Delete)

// find a way to return the length of find, without doing the toArray() is it possible?
// just to improve the performance.

//TODO make sure Repository (READ) operators are done in the Presentation layer

export const queryRepo = {
  async getUsers(
    searchLoginTerm: string | null,
    searchEmailTerm: string | null,
    sortBy: string,
    sortDirection: "asc" | "desc",
    pageNumber: number,
    pageSize: number
  ) {
    const searchLogin = searchLoginTerm
      ? { login: { $regex: searchLoginTerm, $options: "i" } }
      : {};

    const searchEmail = searchEmailTerm
      ? { email: { $regex: searchEmailTerm, $options: "i" } }
      : {};

    const sort: any = {};
    if (sortBy && sortDirection) {
      sort[sortBy] = sortDirection === "desc" ? -1 : 1;
    }

    const skip = pageNumber > 0 ? (pageNumber - 1) * pageSize : 0;

    const cursor = usersCollection.find(
      { $or: [{ ...searchEmail }, { ...searchLogin }] },
      { sort, skip, limit: pageSize }
    );
    const allValues = await cursor.toArray();

    const mappedValues = allValues.map((val) => ({
      login: val?.login,
      email: val?.email,
      createdAt: val?.createdAt,
      id: val?.id,
    }));

    const allValuesCount = await usersCollection.countDocuments({
      $or: [{ ...searchEmail }, { ...searchLogin }],
    });

    const pagesCount =
      allValuesCount < pageSize ? 1 : Math.ceil(allValuesCount / pageSize);

    return { items: mappedValues, pagesCount, totalCount: allValuesCount };
  },
  async getUserByMongoId(mongoId: ObjectId) {
    try {
      return await usersCollection.findOne(
        { _id: mongoId },
        { projection: { _id: 0 } }
      );
    } catch (error) {
      console.log(error);
      return null;
    }
  },

  async findUser(loginOrEmail: string) {
    try {
      return await usersCollection.findOne({
        $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  },
  async findUserByLoginOrEmail(login: string, email: string) {
    try {
      return await usersCollection.findOne({
        login,
        email,
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  },

  async getCommentsForSpecifiedPost(
    postId: string,
    pageSize: number,
    pageNumber: number,
    sortBy: string,
    sortDirection: string
  ) {
    // TODO how do I sort this one?????????

    // think I might need to do some mongoDB courses and improve my knoledge of aggregation stuff

    // const sort: any = {};
    // if (sortBy && sortDirection) {
    //   sort[sortBy] = sortDirection === "desc" ? -1 : 1;
    // }

    // const skip = pageNumber > 0 ? (pageNumber - 1) * pageSize : 0;

    const sort: any = {};
    if (sortBy && sortDirection) {
      sort[sortBy] = sortDirection === "desc" ? -1 : 1;
    }

    const skip = pageNumber > 0 ? (pageNumber - 1) * pageSize : 0;

    const totalCountArr = await postsCollection.aggregate([
      {
        $match: {
          id: "68fe08ff-7030-4b1e-bbe7-91e3e6b24d2d",
        },
      },
      {
        $unwind: {
          path: "$comments",
        },
      },
    ]);

    const resultArr = await postsCollection.aggregate([
      {
        $match: {
          id: postId,
        },
      },
      {
        $unwind: "$comments",
      },
      {
        $project: {
          id: "$comments.id",
          content: "$comments.content",
          userLogin: "$comments.userLogin",
          userId: "$comments.userId",
          createdAt: "$comments.createdAt",
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: pageSize,
      },
      {
        $sort: sort,
      },
    ]);

    const totalCount = await totalCountArr.toArray();

    // return result.toArray();
    const result = await resultArr.toArray();

    const pagesCount =
      totalCount.length < pageSize
        ? 1
        : Math.ceil(totalCount.length / pageSize);

    return {
      items: result.map((r) => ({
        id: r.id,
        content: r.content,
        commentatorInfo: {
          userId: r.userId,
          userLogin: r.userLogin,
        },
        createdAt: r.createdAt,
      })),
      totalCount: totalCount.length,
      pagesCount,
    };
  },

  async getCommentById(id: string) {
    try {
      return await postsCollection.findOne(
        {
          comments: { $elemMatch: { id } },
        },
        { projection: { comments: { $elemMatch: { id } } } }
      );
    } catch (error) {
      console.log(error);
      return null;
    }
  },
};

export default queryRepo;
