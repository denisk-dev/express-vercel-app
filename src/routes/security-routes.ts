/* eslint-disable class-methods-use-this */
import { Router } from "express";
import {
  validateIdParam,
  sendErrorsIfThereAreAny,
} from "../middlewares/input-validation";
import { securityController } from "../composition/security";

const router = Router();

router.get("/devices", securityController.getDevices.bind(securityController));

router.delete(
  "/devices",
  securityController.deleteDevices.bind(securityController)
);

router.delete(
  "/devices/:id",
  [validateIdParam, sendErrorsIfThereAreAny],
  securityController.deleteDevice.bind(securityController)
);

export default router;
