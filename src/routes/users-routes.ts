/* eslint-disable class-methods-use-this */
import { Router } from "express";
import { usersController } from "../composition/users";
import {
  validateQueryParams,
  validatePasswordEmailLogin,
  validateIdParam,
  sendErrorsIfThereAreAny,
} from "../middlewares/input-validation";
import { auth } from "../middlewares/auth-basic";

// TODO remove all of the todos in code
const router = Router();

router.get(
  "/",
  [auth, ...validateQueryParams, sendErrorsIfThereAreAny],
  usersController.getUsers.bind(usersController)
);

router.post(
  "/",
  [auth, ...validatePasswordEmailLogin, sendErrorsIfThereAreAny],
  usersController.addUser.bind(usersController)
);

router.delete(
  "/:id",
  [auth, validateIdParam, sendErrorsIfThereAreAny],
  usersController.deleteUser.bind(usersController)
);

export default router;
