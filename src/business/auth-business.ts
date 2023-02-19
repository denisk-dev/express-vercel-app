import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import add from "date-fns/add";
import isBefore from "date-fns/isBefore";
import isEqual from "date-fns/isEqual";

import { queryRepo } from "../repositories/query-repo";
import { jwtService } from "../application/jwt-service";
import { usersDataAccessLayer } from "../repositories/users-repo";
import { emailManager } from "../manager/email-manager";
import { TAddUser } from "../types/types";

// TODO put the secret keys in one place
const JWT_SECRET =
  process.env.JWT_SECRET ||
  "ro-32-character-ultra-secure-and-ultra-long-secret";

// CUD only
export const authBusinessLogicLayer = {
  async refreshToken(cookies: any) {
    const { refreshToken } = cookies;

    if (typeof refreshToken !== "string") return false;

    let tokenContent: any;
    try {
      tokenContent = jwt.verify(refreshToken, JWT_SECRET);
    } catch (error) {
      return false;
    }

    const { id, deviceId, iat } = tokenContent;

    const existingUser = await queryRepo.getUserByMongoId(id);

    const isExistingDevice = existingUser?.refreshTokensMeta?.filter(
      (e) =>
        e.deviceId === deviceId &&
        isEqual(e.lastActiveDate, new Date(iat * 1000))
    );

    if (
      existingUser &&
      Array.isArray(isExistingDevice) &&
      isExistingDevice.length === 1
    ) {
      const newAccessToken = jwtService.createJWT(
        existingUser,
        "10000",
        "my-32-character-ultra-secure-and-ultra-long-secret"
      );

      const newRefreshToken = jwtService.createJWTrefresh(
        // eslint-disable-next-line no-underscore-dangle
        { _id: existingUser._id, deviceId },
        "20000",
        "ro-32-character-ultra-secure-and-ultra-long-secret"
      );

      const { iat: newiat } = jwt.decode(newRefreshToken) as any;

      const result = await usersDataAccessLayer.findOneAndExpireRefreshToken(
        // eslint-disable-next-line no-underscore-dangle
        existingUser._id.toString(),
        deviceId,
        new Date(iat * 1000),
        new Date(newiat * 1000)
      );

      if (!result) return false;

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    }

    return false;
  },

  async logout(cookies: any) {
    const { refreshToken } = cookies;

    if (typeof refreshToken !== "string") return false;

    let tokenContent: any;
    try {
      tokenContent = jwt.verify(
        refreshToken,
        "ro-32-character-ultra-secure-and-ultra-long-secret"
      );
    } catch (error) {
      // console.log(error);
      return false;
    }

    const { id, deviceId } = tokenContent;

    const existingUser = await queryRepo.getUserByMongoId(id);

    if (!existingUser) return false;

    const result = await usersDataAccessLayer.deleteDeviceSession(id, deviceId);

    if (result?.modifiedCount === 1) {
      return true;
    }
    return false;
  },

  async login(
    loginOrEmail: string,
    password: string,
    ip: string,
    useragent: any
  ) {
    const result = await queryRepo.findUser(loginOrEmail);

    if (result && result.emailConfirmation.isConfirmed) {
      const isValid = await bcrypt.compare(
        password,
        result.accountData.passwordHash
      );

      const deviceId = uuidv4();

      if (isValid) {
        const accessToken = jwtService.createJWT(
          result,
          "10000",
          "my-32-character-ultra-secure-and-ultra-long-secret"
        );

        const refreshToken = jwtService.createJWTrefresh(
          // eslint-disable-next-line no-underscore-dangle
          { _id: result._id.toString(), deviceId },
          "20000",
          "ro-32-character-ultra-secure-and-ultra-long-secret"
        );

        const { iat, deviceId: devid } = jwt.decode(refreshToken) as any;

        const resultOfAddedTokenMetadata =
          await usersDataAccessLayer.findOneAndAddTokenMetaData(
            // eslint-disable-next-line no-underscore-dangle
            result._id.toString(),
            ip,
            useragent,
            iat,
            devid
          );

        if (resultOfAddedTokenMetadata) {
          return { accessToken, refreshToken };
        }
        return false;
      }
    }

    return false;
  },

  async registration(email: string, password: string, login: string) {
    const userByLoginExists = await queryRepo.findUser(login);

    const userByEmailExists = await queryRepo.findUser(email);

    if (userByLoginExists) {
      return { isSuccessful: false, type: "login" };
    }

    if (userByEmailExists) {
      return { isSuccessful: false, type: "email" };
    }

    const passwordHash = await bcrypt.hash(password, 13);

    const user: TAddUser = {
      accountData: {
        userName: login,
        email,
        passwordHash,
        createdAt: new Date(),
      },
      emailConfirmation: {
        confirmationCode: uuidv4(),
        isConfirmed: false,
        expirationDate: add(new Date(), { days: 1 }),
      },
    };

    await usersDataAccessLayer.addUser(user);

    try {
      await emailManager.sendRecoveryMessage(user);
    } catch (error) {
      // probably a right thing to do
      // const deletedResult = await usersDataAccessLayer.deleteUser(user);
      return null;
    }

    return { isSuccessful: true };
  },

  async registrationConfirmation(code: string) {
    const result = await queryRepo.findUserByConfirmationCode(code);

    if (!result) return false;

    if (result?.emailConfirmation.isConfirmed) return false;

    const isNotExpired = isBefore(
      new Date(),
      result?.emailConfirmation.expirationDate
    );

    if (!isNotExpired) return false;

    await usersDataAccessLayer.confirmRegistration(code);
    return true;
  },

  async registrationEmailResending(email: string) {
    const existingUser = await queryRepo.findUser(email);

    if (!existingUser) return false;

    const isNotExpired = isBefore(
      new Date(),
      existingUser?.emailConfirmation.expirationDate
    );

    if (!isNotExpired) return false;

    if (existingUser?.emailConfirmation.isConfirmed) return false;

    const result = await usersDataAccessLayer.changeConfirmationCode(
      existingUser.accountData.email
    );

    if (!result) {
      return false;
    }

    try {
      await emailManager.sendRecoveryMessage(result);
    } catch (error) {
      // probably a right thing to do
      // const deletedResult = await usersDataAccessLayer.deleteUser(user);
      return null;
    }

    return true;
  },

  async passwordRecoveryEmail(email: string) {
    const existingUser = await queryRepo.findUser(email);

    if (!existingUser) return false;

    const recoveryCode = uuidv4();

    const result = await usersDataAccessLayer.findUserAndUpdatePasswordReset(
      // eslint-disable-next-line no-underscore-dangle
      existingUser._id.toString(),
      recoveryCode
    );

    if (!result) return false;

    try {
      await emailManager.sendPasswordRecoveryMessage(
        existingUser.accountData.email,
        recoveryCode
      );

      return true;
    } catch (error) {
      // probably a right thing to do
      // const deletedResult = await usersDataAccessLayer.deleteUser(user);
      return null;
    }
  },

  async updatePassword(newPassword: string, recoveryCode: string) {
    const passwordHash = await bcrypt.hash(newPassword, 13);

    const result = await queryRepo.findUserByPasswordRecoveryCode(
      recoveryCode,
      passwordHash
    );

    if (!result) return false;

    return true;
  },
};

export default authBusinessLogicLayer;
