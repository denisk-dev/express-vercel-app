import { NextFunction, Request, Response } from "express";

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  const authArr =
    typeof authorization === "string" ? authorization.split(" ") : null;

  const token =
    Array.isArray(authArr) && authArr.length === 2 ? authArr[1] : null;

  const tokenType =
    Array.isArray(authArr) && authArr.length === 2 ? authArr[0] : "";

  const expectedToken = Buffer.from("admin:qwerty").toString("base64");

  if (
    token === expectedToken &&
    tokenType.toLowerCase() === "Basic".toLowerCase()
  ) {
    next();
  } else {
    res.sendStatus(401);
  }
};

export default auth;
