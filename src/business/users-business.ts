/* eslint-disable class-methods-use-this */
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { UsersRepository } from "../repositories/users-repo";
import { QueryRepository } from "../repositories/query-repo";

// CUD only
export class UsersBusiness {
  constructor(
    protected queryRepository: QueryRepository,
    protected userRepository: UsersRepository
  ) {}

  async addNewUser(login: string, password: string, email: string) {
    const user = await this.queryRepository.findUserByLoginOrEmail(
      login,
      email
    );

    if (user) {
      return false;
    }

    // Dymich creates separate function
    const hash = await bcrypt.hash(password, 13);

    // TODO I think I need to create a way to check if the same login/email doesn't exist
    const result = await this.userRepository.addUser({
      accountData: {
        userName: login,
        email,
        passwordHash: hash,
        createdAt: new Date(),
      },
      emailConfirmation: {
        confirmationCode: uuidv4(),
        isConfirmed: true,
        expirationDate: new Date(),
      },
    });

    // eslint-disable-next-line no-underscore-dangle
    if (result && result._id) {
      return {
        login: result?.accountData.userName,
        email: result?.accountData.email,
        createdAt: result?.accountData.createdAt,
        // eslint-disable-next-line no-underscore-dangle
        id: result?._id,
      };
    }

    return false;
  }

  async deleteUserById(id: string) {
    const result = await this.userRepository.deleteUser(id);

    if (result && result.deletedCount === 1) {
      return true;
    }

    return false;
  }
}

export default UsersBusiness;
