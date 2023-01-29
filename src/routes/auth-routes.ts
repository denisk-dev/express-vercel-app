import { Router, Request, Response } from "express";
import { auth } from "../middlewares/auth";
import {
  login,
  sendErrorsIfThereAreAny,
} from "../middlewares/input-validation";

import { authBusinessLogicLayer } from "../business/auth-business";

const router = Router();

router.post(
  "/login",
  [...login, sendErrorsIfThereAreAny],
  async (req: Request, res: Response) => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const { loginOrEmail, password } = req.body;

    const token = await authBusinessLogicLayer.login(loginOrEmail, password);

    if (token) {
      return res.status(200).send({ accessToken: token });
    }

    return res.sendStatus(401);
  }
);

router.get("/me", [auth], (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const { email, login, id } = req.context.user;

  res.send({ email, login, userId: id });
});

export default router;
