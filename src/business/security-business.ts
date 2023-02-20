/* eslint-disable class-methods-use-this */
import jwt from "jsonwebtoken";
import { QueryRepository } from "../repositories/query-repo";
import { SecurityRepository } from "../repositories/security-repo";

// TODO put the secret keys in one place
const JWT_SECRET =
  process.env.JWT_SECRET ||
  "ro-32-character-ultra-secure-and-ultra-long-secret";

export class SecurityBusiness {
  constructor(
    protected queryRepository: QueryRepository,
    protected securityRepository: SecurityRepository
  ) {}

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

    const existingUser = await this.queryRepository.getUserByMongoId(id);

    if (existingUser) {
      return existingUser.refreshTokensMeta;
    }

    return false;
  }

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

    await this.securityRepository.removeAllDevices(id, deviceId);

    return true;
  }

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

    const user = await this.queryRepository.findUserByDeviceId(deviceId);

    if (!user) {
      return 404;
    }

    // eslint-disable-next-line no-underscore-dangle
    if (user?._id.toString() !== id) {
      return 403;
    }

    const result = await this.securityRepository.removeDevice(id, deviceId);

    if (result?.modifiedCount === 1) {
      return 204;
    }

    return 404;
  }
}

export default SecurityBusiness;
