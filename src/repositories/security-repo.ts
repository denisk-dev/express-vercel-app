import { ObjectId } from "mongodb";
import { usersCollection } from "../db/db";

export const securityDataAccessLayer = {
  async removeAllDevices(userId: string, deviceId: string) {
    try {
      return await usersCollection.updateMany(
        { _id: new ObjectId(userId) },
        { $pull: { refreshTokensMeta: { deviceId: { $ne: deviceId } } } }
      );
    } catch (e) {
      console.log(e);
      return null;
    }
  },

  async removeDevice(id: string, deviceId: string) {
    try {
      return await usersCollection.updateOne(
        { _id: new ObjectId(id) },
        { $pull: { refreshTokensMeta: { deviceId } } }
      );
    } catch (e) {
      console.log(e);
      return null;
    }
  },
};

export default securityDataAccessLayer;
