import { Router, Request, Response } from "express";
import { getApiLimiter } from "../utils/getApiLimiter";
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

router.post("/refresh-token", async (req: Request, res: Response) => {
  const result = await authBusinessLogicLayer.refreshToken(req.cookies);

  if (result) {
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return res.status(200).send({ accessToken: result.accessToken });
  }
  return res.sendStatus(401);
});

router.post(
  "/login",
  [getApiLimiter(), ...login, sendErrorsIfThereAreAny],
  async (req: Request, res: Response) => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const { loginOrEmail, password } = req.body;

    const token = await authBusinessLogicLayer.login(
      loginOrEmail,
      password,
      req.ip,
      req.useragent
    );

    if (token) {
      res.cookie("refreshToken", token.refreshToken, {
        httpOnly: true,
        secure: true,
      });
      return res.status(200).send({ accessToken: token.accessToken });
    }

    return res.sendStatus(401);
  }
);

router.get("/me", [auth], (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/no-shadow, @typescript-eslint/naming-convention
  const { accountData, _id } = req.context.user;

  const { email, userName } = accountData;

  res.send({ email, login: userName, userId: _id });
});

router.post(
  "/registration-confirmation",
  [getApiLimiter(), validateRegistrationCode, sendErrorsIfThereAreAny],
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
  getApiLimiter(),
  [...validateRegistration, sendErrorsIfThereAreAny],
  async (req: Request, res: Response) => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const { login, password, email } = req.body;

    const result = await authBusinessLogicLayer.registration(
      email,
      password,
      login
    );

    if (!result?.isSuccessful) {
      return res.status(400).send({
        errorsMessages: [
          {
            message: "User exists",
            field: result?.type,
          },
        ],
      });
    }

    return res.sendStatus(204);
  }
);

router.post(
  "/registration-email-resending",
  [getApiLimiter(), validateEmailOnly, sendErrorsIfThereAreAny],
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

router.post("/logout", async (req: Request, res: Response) => {
  const result = await authBusinessLogicLayer.logout(req.cookies);

  if (result) {
    res.cookie("refreshToken", "", {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(204);
  }
  return res.sendStatus(401);
});

export default router;
