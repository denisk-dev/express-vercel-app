import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { queryRepo } from "../repositories/query-repo";
import { securityDataAccessLayer } from "../repositories/security-repo";

//TODO put the secret keys in one place
const JWT_SECRET =
  process.env.JWT_SECRET ||
  "ro-32-character-ultra-secure-and-ultra-long-secret";

export const securityBusinessLogicLayer = {
  async getAllDevices(cookies: any) {
    const { refreshToken } = cookies;

    if (typeof refreshToken !== "string") return false;

    let tokenContent: any;
    try {
      tokenContent = jwt.verify(refreshToken, JWT_SECRET);
    } catch (error) {
      return false;
    }

    const { id } = tokenContent;

    const existingUser = await queryRepo.getUserByMongoId(new ObjectId(id));

    if (existingUser) {
      return existingUser.refreshTokensMeta;
    }

    return false;
  },

  async removeAllDevices(cookies: any) {
    const { refreshToken } = cookies;

    if (typeof refreshToken !== "string") return false;

    let tokenContent: any;
    try {
      tokenContent = jwt.verify(refreshToken, JWT_SECRET);
    } catch (error) {
      return false;
    }

    const { id, deviceId } = tokenContent;

    await securityDataAccessLayer.removeAllDevices(id, deviceId);

    return true;
  },

  async removeDevice(cookies: any, deviceId: string) {
    const { refreshToken } = cookies;

    if (typeof refreshToken !== "string") return 401;

    let tokenContent: any;
    try {
      tokenContent = jwt.verify(refreshToken, JWT_SECRET);
    } catch (error) {
      return 401;
    }

    const { id } = tokenContent;

    const user = await queryRepo.findUserByDeviceId(deviceId);

    if (!user) {
      return 404;
    }

    // eslint-disable-next-line no-underscore-dangle
    if (user?._id.toString() !== id) {
      return 403;
    }

    const result = await securityDataAccessLayer.removeDevice(id, deviceId);

    if (result?.modifiedCount === 1) {
      return 204;
    }

    return 404;
  },
};

export default securityBusinessLogicLayer;
