/* eslint-disable class-methods-use-this */
import { Request, Response } from "express";
import { AuthBusiness } from "../business/auth-business";

export class AuthController {
  constructor(protected authBusiness: AuthBusiness) {}

  async refreshToken(req: Request, res: Response) {
    const result = await this.authBusiness.refreshToken(req.cookies);

    if (result) {
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: true,
      });
      return res.status(200).send({ accessToken: result.accessToken });
    }
    return res.sendStatus(401);
  }

  async login(req: Request, res: Response) {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const { loginOrEmail, password } = req.body;

    const token = await this.authBusiness.login(
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

  me(req: Request, res: Response) {
    // eslint-disable-next-line @typescript-eslint/no-shadow, @typescript-eslint/naming-convention
    const { accountData, _id } = req.context.user;

    const { email, userName } = accountData;

    res.send({ email, login: userName, userId: _id });
  }

  async passwordRecovery(req: Request, res: Response) {
    const { email } = req.body;

    await this.authBusiness.passwordRecoveryEmail(email);

    return res.sendStatus(204);
  }

  async newPassword(req: Request, res: Response) {
    const { newPassword, recoveryCode } = req.body;

    const isSent = await this.authBusiness.updatePassword(
      newPassword,
      recoveryCode
    );

    if (isSent) {
      return res.sendStatus(204);
    }
    return res.status(400).send({
      errorsMessages: [
        {
          message: "Some error",
          field: "recoveryCode",
        },
      ],
    });
  }

  async registrationConfirmation(req: Request, res: Response) {
    const { code } = req.body;

    const isVerified = await this.authBusiness.registrationConfirmation(code);

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

  async registration(req: Request, res: Response) {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const { login, password, email } = req.body;

    const result = await this.authBusiness.registration(email, password, login);

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

  async registrationEmailResending(req: Request, res: Response) {
    const { email } = req.body;

    const isResent = await this.authBusiness.registrationEmailResending(email);

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

  async logout(req: Request, res: Response) {
    const result = await this.authBusiness.logout(req.cookies);

    if (result) {
      res.cookie("refreshToken", "", {
        httpOnly: true,
        secure: true,
      });
      return res.sendStatus(204);
    }
    return res.sendStatus(401);
  }
}

export default AuthController;
