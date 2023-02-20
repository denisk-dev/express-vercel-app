import { AuthController } from "../controllers/auth-controller";
import { AuthBusiness } from "../business/auth-business";
import { QueryRepository } from "../repositories/query-repo";

import { UsersRepository } from "../repositories/users-repo";

const queryRepository = new QueryRepository();

const usersRepository = new UsersRepository();

const authBusiness = new AuthBusiness(queryRepository, usersRepository);

export const authController = new AuthController(authBusiness);

export default authController;
