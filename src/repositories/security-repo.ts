import UsersSchema from "../models/Users";

export const securityDataAccessLayer = {
  async removeAllDevices(userId: string, deviceId: string) {
    try {
      return await UsersSchema.updateMany(
        { _id: userId },
        { $pull: { refreshTokensMeta: { deviceId: { $ne: deviceId } } } }
      );
    } catch (e) {
      console.log(e);
      return null;
    }
  },

  async removeDevice(id: string, deviceId: string) {
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
};

export default securityDataAccessLayer;
