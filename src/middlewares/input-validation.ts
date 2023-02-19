import { body, validationResult, query, param } from "express-validator";

import { NextFunction, Request, Response } from "express";
import { blogsDataAccessLayer } from "../repositories/blogs-repo";

export const validateBlog = [
  body("name").isString().trim().isLength({ min: 3, max: 15 }),
  body("description").isString().trim().isLength({ min: 3, max: 500 }),
  body("websiteUrl")
    .trim()
    .isLength({ min: 8, max: 100 })
    .matches(
      /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)$/
    ),
];

export const validatePost = [
  body("title").isString().trim().isLength({ min: 3, max: 30 }),
  body("shortDescription").isString().trim().isLength({ min: 3, max: 100 }),
  body("content").isString().trim().isLength({ min: 3, max: 1000 }),
];

export const sendErrorsIfThereAreAny = (
  req: Request,
  res: Response,
  next: NextFunction
  // eslint-disable-next-line consistent-return
) => {
  const errors = validationResult(req);

  // todo, do i need to find a way to send all errors at the same time????

  const formattedError = errors
    .array({ onlyFirstError: true })
    .map((e) => ({ message: e.msg, field: e.param }));

  if (!errors.isEmpty()) {
    return res.status(400).json({ errorsMessages: formattedError });
  }

  next();
};

export const validateBlogIdBody = body("blogId")
  .not()
  .isEmpty()
  .trim()
  .isString()
  .custom(async (input) => {
    const existingBlog = await blogsDataAccessLayer.getById(input);

    if (!existingBlog) {
      throw new Error("somethiw wrong with blogId");
    }
    return true;
  });

export const validateBlogIdParam = param("blogId")
  .trim()
  .isString()
  .isLength({ min: 1, max: 90 });

export const validateQueryParams = [
  // .matches(/^[a-zA-Z0-9]+$/),
  query("pageNumber")
    .trim()
    .custom(async (input) => {
      if (!Number.isNaN(Number(input)) || input === "") {
        return true;
      }
      throw new Error("somethiw wrong with pageNumber");
    }),
  query("pageSize")
    .trim()
    .custom(async (input) => {
      if (!Number.isNaN(Number(input)) || input === "") {
        return true;
      }
      throw new Error("somethiw wrong with pageSize");
    }),
  query("sortBy").trim().isString(),
  // .matches(/^[a-zA-Z]+$/),

  query("sortDirection")
    .trim()
    .isString()
    .custom((input) => {
      if (input === "desc" || input === "asc" || input === "") {
        return true;
      }
      throw new Error("somethiw wrong with sortDirection");
    }),
  // .matches(/^[a-zA-Z]+$/),
];

export const validatePasswordEmailLogin = [
  body("login").isString().trim().isLength({ min: 3, max: 10 }),
  body("password").isString().trim().isLength({ min: 6, max: 20 }),
  body("email").isEmail().trim().not().isEmpty(),
];

export const validateIdParam = param("id").not().isEmpty();

export const login = [
  body("loginOrEmail").isString().trim().not().isEmpty(),
  body("password").isString().trim().not().isEmpty(),
];

export const commentIdValidation = param("commentId")
  .isString()
  .trim()
  .not()
  .isEmpty();

export const commentContentValidation = body("content")
  .isString()
  .trim()
  .isLength({ min: 20, max: 300 });

export const validateRegistrationCode = body("code")
  .isString()
  .trim()
  .not()
  .isEmpty();

export const validateEmailOnly = body("email")
  .isEmail()
  .trim()
  .not()
  .isEmpty()
  .matches(/^[\w-\\.]+@([\w-]+\.)+[\w-]{2,4}$/);

export const validateRegistration = [
  body("login")
    .isString()
    .trim()
    .isLength({ min: 3, max: 10 })
    .matches(/^[a-zA-Z0-9_-]*$/),
  body("password").isString().trim().isLength({ min: 6, max: 20 }),
  body("email")
    .isEmail()
    .trim()
    .not()
    .isEmpty()
    .matches(/^[\w-\\.]+@([\w-]+\.)+[\w-]{2,4}$/),
];

export const validateNewPassword = [
  body("newPassword").isString().trim().isLength({ min: 6, max: 20 }),
  body("recoveryCode").isString().trim().not().isEmpty(),
];
