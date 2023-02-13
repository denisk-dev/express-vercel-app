import { Router, Request, Response } from "express";
import {
  validateIdParam,
  sendErrorsIfThereAreAny,
} from "../middlewares/input-validation";
import { securityBusinessLogicLayer } from "../business/security-business";

const router = Router();

router.get("/devices", async (req: Request, res: Response) => {
  const result = await securityBusinessLogicLayer.getAllDevices(req.cookies);

  if (result) {
    return res.status(200).send(result);
  }

  return res.sendStatus(401);
});

router.delete("/devices", async (req: Request, res: Response) => {
  const result = await securityBusinessLogicLayer.removeAllDevices(req.cookies);

  if (result) {
    return res.sendStatus(204);
  }
  return res.sendStatus(401);
});

router.delete(
  "/devices/:id",
  [validateIdParam, sendErrorsIfThereAreAny],
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await securityBusinessLogicLayer.removeDevice(
      req.cookies,
      id
    );
    if (result === 204) {
      return res.sendStatus(204);
    }

    if (result === 401) {
      return res.sendStatus(401);
    }

    if (result === 403) {
      return res.sendStatus(403);
    }

    return res.sendStatus(404);
  }
);

export default router;
