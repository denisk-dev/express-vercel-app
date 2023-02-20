/* eslint-disable class-methods-use-this */
import { Router } from "express";
import { getApiLimiter } from "../utils/getApiLimiter";
import { auth } from "../middlewares/auth";
import {
  login,
  sendErrorsIfThereAreAny,
  validateRegistration,
  validateRegistrationCode,
  validateEmailOnly,
  validateNewPassword,
} from "../middlewares/input-validation";

import { authController } from "../composition/auth";

const router = Router();

router.post("/refresh-token", authController.refreshToken.bind(authController));

router.post(
  "/login",
  [getApiLimiter(), ...login, sendErrorsIfThereAreAny],
  authController.login.bind(authController)
);

router.get("/me", [auth], authController.me.bind(authController));

router.post(
  "/password-recovery",
  [getApiLimiter(), validateEmailOnly, sendErrorsIfThereAreAny],
  authController.passwordRecovery.bind(authController)
);

router.post(
  "/new-password",
  [getApiLimiter(), ...validateNewPassword, sendErrorsIfThereAreAny],
  authController.newPassword.bind(authController)
);

router.post(
  "/registration-confirmation",
  [getApiLimiter(), validateRegistrationCode, sendErrorsIfThereAreAny],
  authController.registrationConfirmation.bind(authController)
);

router.post(
  "/registration",
  getApiLimiter(),
  [...validateRegistration, sendErrorsIfThereAreAny],
  authController.registration.bind(authController)
);

router.post(
  "/registration-email-resending",
  [getApiLimiter(), validateEmailOnly, sendErrorsIfThereAreAny],
  authController.registrationEmailResending.bind(authController)
);

router.post("/logout", authController.logout.bind(authController));

export default router;
