import { v4 as uuidv4 } from "uuid";
import { TAddUser } from "../types/types";
import UsersSchema from "../models/Users";

export const usersDataAccessLayer = {
  async addUser(props: TAddUser) {
    try {
      return await UsersSchema.create({
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
      return await UsersSchema.deleteOne({ _id: id });
    } catch (e) {
      console.log(e);
      return null;
    }
  },

  async deleteDeviceSession(id: string, deviceId: string) {
    try {
      return await UsersSchema.updateOne(
        { _id: id },
        { $pull: { refreshTokensMeta: { deviceId } } }
      );
    } catch (e) {
      console.log(e);
      return null;
    }
  },

  async removeAllUsers() {
    await UsersSchema.deleteMany({});
  },

  async confirmRegistration(code: string) {
    try {
      return await UsersSchema.findOneAndUpdate(
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
      return await UsersSchema.findOneAndUpdate(
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

  async findOneAndExpireRefreshToken(
    id: string,
    deviceId: string,
    iat: Date,
    newiat: Date
  ) {
    try {
      return await UsersSchema.findOneAndUpdate(
        {
          _id: id,
          "refreshTokensMeta.deviceId": deviceId,
          "refreshTokensMeta.lastActiveDate": iat,
        },
        {
          $set: {
            "refreshTokensMeta.$.lastActiveDate": newiat,
          },
        },
        { returnDocument: "after" }
      );
    } catch (error) {
      console.log(error);
      return null;
    }
  },

  async findOneAndAddTokenMetaData(
    id: string,
    ip: string,
    useragent: any,
    refreshTokenIssuedAt: number,
    deviceId: string
  ) {
    try {
      return await UsersSchema.findOneAndUpdate(
        {
          _id: id,
        },
        {
          $push: {
            refreshTokensMeta: {
              lastActiveDate: new Date(refreshTokenIssuedAt * 1000),
              ip,
              title: useragent.source,
              deviceId,
            },
          },
        }
      );
    } catch (error) {
      console.log(error);
      return null;
    }
  },

  async findUserAndUpdatePasswordReset(id: string, recoveryCode: string) {
    try {
      return await UsersSchema.findOneAndUpdate(
        {
          _id: id,
        },
        {
          $set: {
            "passwordRecovery.recoveryCode": recoveryCode,
          },
        },
        { returnDocument: "after" }
      );
    } catch (error) {
      console.log(error);
      return null;
    }
  },
};

export default usersDataAccessLayer;
