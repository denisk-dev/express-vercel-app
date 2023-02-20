import { Request, Response } from "express";
import { SecurityBusiness } from "../business/security-business";

export class SecurityController {
  constructor(protected securityBusiness: SecurityBusiness) {}

  async getDevices(req: Request, res: Response) {
    const result = await this.securityBusiness.getAllDevices(req.cookies);

    const mappedDate = Array.isArray(result)
      ? result?.map((r) => ({
          lastActiveDate: r.lastActiveDate.toISOString(),
          ip: r.ip,
          title: r.title,
          deviceId: r.deviceId,
        }))
      : null;

    if (result) {
      return res.status(200).send(mappedDate);
    }

    return res.sendStatus(401);
  }

  async deleteDevices(req: Request, res: Response) {
    const result = await this.securityBusiness.removeAllDevices(req.cookies);

    if (result) {
      return res.sendStatus(204);
    }
    return res.sendStatus(401);
  }

  async deleteDevice(req: Request, res: Response) {
    const { id } = req.params;

    const result = await this.securityBusiness.removeDevice(req.cookies, id);
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
}

export default SecurityController;
