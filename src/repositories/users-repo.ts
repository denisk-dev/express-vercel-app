import { ObjectId } from "mongodb";
import { v4 as uuidv4 } from "uuid";
import { usersCollection } from "../db/db";
import { TAddUser } from "../types/types";

export const usersDataAccessLayer = {
  async addUser(props: TAddUser) {
    try {
      return await usersCollection.insertOne({
        ...props,
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  },
  async deleteUser(id: string) {
    // let _id = ObjectId(id);
    try {
      return await usersCollection.deleteOne({ _id: new ObjectId(id) });
    } catch (e) {
      console.log(e);
      return null;
    }
  },

  async removeAllUsers() {
    await usersCollection.deleteMany({});
  },

  async confirmRegistration(code: string) {
    try {
      return await usersCollection.findOneAndUpdate(
        {
          "emailConfirmation.confirmationCode": code,
        },
        { $set: { "emailConfirmation.isConfirmed": true } }
      );
    } catch (error) {
      console.log(error);
      return null;
    }
  },

  async changeConfirmationCode(email: string) {
    try {
      return await usersCollection.findOneAndUpdate(
        {
          "accountData.email": email,
        },
        { $set: { "emailConfirmation.confirmationCode": uuidv4() } },
        { returnDocument: "after" }
      );
    } catch (error) {
      console.log(error);
      return null;
    }
  },

  async findOneAndExpireRefreshToken(id: ObjectId, token: string) {
    try {
      return await usersCollection.findOneAndUpdate(
        {
          _id: new ObjectId(id),
        },
        { $push: { expiredRefreshTokens: token } },
        { returnDocument: "after" }
      );
    } catch (error) {
      console.log(error);
      return null;
    }
  },
};

export default usersDataAccessLayer;
