/* eslint-disable class-methods-use-this */
import { ObjectId } from "mongodb";
import { skip, getSortBy } from "../utils/pagination";
import UsersSchema from "../models/Users";
import PostsSchema from "../models/Posts";

// TODO read only stuff are supposed to be here

// The types for Output data will be stored here.
// Use the mapper to map DB response to expected Output model for Presentation Layer

// ANOTHER TODO

// notes from lesson 3
// IDEALLY WHEN WE ADD,UPDATE blogs/posts, the verification that something exists(first get request)
// WILL NEED TO HAPPEN IN THE BUSINESS LAYER, NOT IN THE PRESENTATION LAYER(Create, Update, Delete)

// find a way to return the length of find, without doing the toArray() is it possible?
// just to improve the performance.

// TODO make sure Repository (READ) operators are done in the Presentation layer

export class QueryRepository {
  async getUsers(
    searchLoginTerm: string | null,
    searchEmailTerm: string | null,
    sortBy: string,
    sortDirection: "asc" | "desc",
    pageNumber: number,
    pageSize: number
  ) {
    const searchLogin = searchLoginTerm
      ? { "accountData.userName": { $regex: searchLoginTerm, $options: "i" } }
      : {};

    const searchEmail = searchEmailTerm
      ? { "accountData.email": { $regex: searchEmailTerm, $options: "i" } }
      : {};

    const sort = getSortBy(sortDirection, sortBy);

    const allValues = await UsersSchema.find(
      { $or: [{ ...searchEmail }, { ...searchLogin }] },
      null,
      { skip: skip(pageNumber, pageSize) }
    )
      .sort(sort)
      .limit(pageSize)
      .lean();

    const mappedValues = allValues.map((val) => ({
      login: val?.accountData.userName,
      email: val?.accountData.email,
      createdAt: val?.accountData.createdAt,
      // eslint-disable-next-line no-underscore-dangle
      id: val?._id,
    }));

    const allValuesCount = await UsersSchema.countDocuments({
      $or: [{ ...searchEmail }, { ...searchLogin }],
    });

    const pagesCount =
      allValuesCount < pageSize ? 1 : Math.ceil(allValuesCount / pageSize);

    return { items: mappedValues, pagesCount, totalCount: allValuesCount };
  }

  async getUserByMongoId(mongoId: string) {
    try {
      return await UsersSchema.findOne(
        { _id: mongoId }
        // { projection: { _id: 0 } }
      );
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async findUser(loginOrEmail: string) {
    try {
      return await UsersSchema.findOne({
        $or: [
          { "accountData.userName": loginOrEmail },
          { "accountData.email": loginOrEmail },
        ],
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async findUserByLoginOrEmail(login: string, email: string) {
    try {
      return await UsersSchema.findOne({
        $or: [
          { "accountData.userName": login },
          { "accountData.email": email },
        ],
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getCommentsForSpecifiedPost(
    postId: string,
    pageSize: number,
    pageNumber: number,
    sortBy: string,
    sortDirection: string
  ) {
    const sort = getSortBy(sortDirection, sortBy);

    const totalCount = await PostsSchema.aggregate([
      {
        $match: {
          id: postId,
        },
      },
      {
        $unwind: {
          path: "$comments",
        },
      },
    ]);

    const result = await PostsSchema.aggregate([
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
        $sort: sort,
      },
      {
        $skip: skip(pageNumber, pageSize),
      },
      {
        $limit: pageSize,
      },
    ]);

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
  }

  async getCommentById(id: string) {
    try {
      return await PostsSchema.aggregate([
        {
          $match: {
            comments: {
              $elemMatch: {
                _id: new ObjectId(id),
              },
            },
          },
        },
        {
          $unwind: {
            path: "$comments",
          },
        },
        {
          $match: {
            "comments._id": new ObjectId(id),
          },
        },
        {
          $project: {
            comments: 1,
          },
        },
      ]);
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async findUserByConfirmationCode(code: string) {
    try {
      return await UsersSchema.findOne({
        "emailConfirmation.confirmationCode": code,
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async findUserByPasswordRecoveryCode(code: string, newPassword: string) {
    try {
      return await UsersSchema.findOneAndUpdate(
        {
          "passwordRecovery.recoveryCode": code,
        },
        {
          $set: {
            "accountData.passwordHash": newPassword,
            "passwordRecovery.recoveryCode": "",
          },
        },
        { returnDocument: "after" }
      );
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async findUserByDeviceId(deviceId: string) {
    try {
      return await PostsSchema.findOne({
        refreshTokensMeta: { $elemMatch: { deviceId } },
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

export default QueryRepository;
