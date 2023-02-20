import { UserController } from "../controllers/users-controller";
import { UsersBusiness } from "../business/users-business";
import { QueryRepository } from "../repositories/query-repo";

import { UsersRepository } from "../repositories/users-repo";

const queryRepository = new QueryRepository();

const usersBusiness = new UsersBusiness(
  new QueryRepository(),
  new UsersRepository()
);

export const usersController = new UserController(
  queryRepository,
  usersBusiness
);

export default usersController;
