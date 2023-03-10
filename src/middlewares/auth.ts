import { NextFunction, Request, Response } from "express";
import { jwtService } from "../application/jwt-service";
import { QueryRepository } from "../repositories/query-repo";

const queryRepository = new QueryRepository();

// TODO refactor using JWT!

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.sendStatus(401);
  }

  const authArr =
    typeof authorization === "string" ? authorization.split(" ") : null;

  const token =
    Array.isArray(authArr) && authArr.length === 2 ? authArr[1] : null;

  const tokenType =
    Array.isArray(authArr) && authArr.length === 2 ? authArr[0] : "";

  if (!token || tokenType !== "Bearer") {
    return res.sendStatus(401);
  }

  const userId = jwtService.getUserIdByToken(token);

  const user = userId ? await queryRepository.getUserByMongoId(userId) : null;

  if (user) {
    req.context = { user };
    return next();
  }

  return res.sendStatus(401);
};

export default auth;
