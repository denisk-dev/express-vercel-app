import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import add from "date-fns/add";
import isBefore from "date-fns/isBefore";
import { queryRepo } from "../repositories/query-repo";
import { jwtService } from "../application/jwt-service";
import { usersDataAccessLayer } from "../repositories/users-repo";
import { emailManager } from "../manager/email-manager";
import { TAddUser } from "../types/types";
// CUD only
export const authBusinessLogicLayer = {
  async login(loginOrEmail: string, password: string) {
    const result = await queryRepo.findUser(loginOrEmail);

    if (result && result.emailConfirmation.isConfirmed) {
      const isValid = await bcrypt.compare(
        password,
        result.accountData.passwordHash
      );

      if (isValid) {
        const token = jwtService.createJWT(result);

        return token;
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

    if (
      result?.value === null ||
      result?.value === undefined ||
      result?.ok === 0
    ) {
      return false;
    }

    try {
      await emailManager.sendRecoveryMessage(result?.value);
    } catch (error) {
      // probably a right thing to do
      // const deletedResult = await usersDataAccessLayer.deleteUser(user);
      return null;
    }

    return true;
  },
};

export default authBusinessLogicLayer;
