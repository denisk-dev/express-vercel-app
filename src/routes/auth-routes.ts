import { Router, Request, Response } from "express";

import { auth } from "../middlewares/auth";
import {
  login,
  sendErrorsIfThereAreAny,
  validateRegistration,
  validateRegistrationCode,
  validateEmailOnly,
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

router.post(
  "/registration-confirmation",
  [validateRegistrationCode, sendErrorsIfThereAreAny],
  async (req: Request, res: Response) => {
    const { code } = req.body;

    const isVerified = await authBusinessLogicLayer.registrationConfirmation(
      code
    );

    if (!isVerified) {
      return res.status(400).send({
        errorsMessages: [
          {
            message:
              "confirmation code is incorrect, expired or already been applied",
            field: "code",
          },
        ],
      });
    }

    return res.sendStatus(204);
  }
);

router.post(
  "/registration",
  [...validateRegistration, sendErrorsIfThereAreAny],
  async (req: Request, res: Response) => {
    const { login, password, email } = req.body;

    const isExistingUser = await authBusinessLogicLayer.registration(
      email,
      password,
      login
    );

    if (!isExistingUser) {
      return res.status(400).send({
        errorsMessages: [
          {
            message: "User exists",
            field: "login or email",
          },
        ],
      });
    }

    return res.sendStatus(204);
  }
);

router.post(
  "/registration-email-resending",
  [validateEmailOnly, sendErrorsIfThereAreAny],
  async (req: Request, res: Response) => {
    const { email } = req.body;

    const isResent = await authBusinessLogicLayer.registrationEmailResending(
      email
    );

    if (!isResent) {
      return res.status(400).send({
        errorsMessages: [
          {
            message: "has incorrect values or if email is already confirmed",
            field: "email",
          },
        ],
      });
    }

    return res.sendStatus(204);
  }
);

export default router;
