import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { usersDataAccessLayer } from "../repositories/users-repo";
import { queryRepo } from "../repositories/query-repo";

// CUD only
export const usersBusinessLogicLayer = {
  async addNewUser(login: string, password: string, email: string) {
    // TODO I NEED TO HASH PASSWORD!!!!!!!

    const user = await queryRepo.findUserByLoginOrEmail(login, email);

    if (user) {
      return false;
    }

    // Dymich creates separate function
    const hash = await bcrypt.hash(password, 13);

    // TODO some more research (using Dymich way implement hashing and salt of password)
    // const passwordHash = await generateHash(password, salt);

    const id = uuidv4();

    // TODO I think I need to create a way to check if the same login/email doesn't exist
    const result = await usersDataAccessLayer.addUser(
      login,
      hash,
      email,
      new Date(),
      id
    );

    if (result && result.insertedId) {
      const newlyAddedUser = await queryRepo.getUserByMongoId(
        result.insertedId
      );

      if (!newlyAddedUser) {
        return false;
      }

      return {
        login: newlyAddedUser?.login,
        email: newlyAddedUser?.email,
        createdAt: newlyAddedUser?.createdAt,
        id: newlyAddedUser?.id,
      };
    }

    return false;
  },
  async deleteUserById(id: string) {
    const result = await usersDataAccessLayer.deleteUser(id);

    if (result && result.deletedCount === 1) {
      return true;
    }

    return false;
  },
};

export default usersBusinessLogicLayer;
