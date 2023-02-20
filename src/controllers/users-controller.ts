import { Request, Response } from "express";
import { UsersBusiness } from "../business/users-business";
import { QueryRepository } from "../repositories/query-repo";

export class UserController {
  constructor(
    protected queryRepository: QueryRepository,
    protected usersBusiness: UsersBusiness
  ) {}

  async getUsers(req: Request, res: Response) {
    const searchLoginTerm = req.query.searchLoginTerm
      ? req.query.searchLoginTerm
      : null;
    const searchEmailTerm = req.query.searchEmailTerm
      ? req.query.searchEmailTerm
      : null;
    const pageNumber = req.query.pageNumber ? req.query.pageNumber : 1;
    const pageSize = req.query.pageSize ? req.query.pageSize : 10;
    const sortBy = req.query.sortBy ? req.query.sortBy : "createdAt";
    const sortDirection = req.query.sortDirection
      ? req.query.sortDirection
      : "desc";

    const searchLoginTermType =
      typeof searchLoginTerm === "string" || searchLoginTerm === null;
    const searchEmailTermType =
      typeof searchEmailTerm === "string" || searchEmailTerm === null;

    const sortByType = typeof sortBy === "string";

    const sortDirectionValue =
      sortDirection === "asc" || sortDirection === "desc";

    if (
      searchLoginTermType &&
      searchEmailTermType &&
      sortByType &&
      sortDirectionValue
    ) {
      const result = await this.queryRepository.getUsers(
        searchLoginTerm,
        searchEmailTerm,
        sortBy,
        sortDirection,
        Number(pageNumber),
        Number(pageSize)
      );

      const resObject = {
        pagesCount: result.pagesCount,
        page: Number(pageNumber),
        pageSize: Number(pageSize),
        totalCount: result.totalCount,
        items: result.items,
      };

      return res.status(200).send(resObject);
    }
    return res.sendStatus(500);
  }

  async addUser(req: Request, res: Response) {
    const { login, password, email } = req.body;

    const user = await this.usersBusiness.addNewUser(login, password, email);

    if (user) {
      return res.status(201).send(user);
    }
    return res.sendStatus(500);
  }

  async deleteUser(req: Request, res: Response) {
    const { id } = req.params;

    const isDeleted = await this.usersBusiness.deleteUserById(id);

    if (isDeleted) {
      return res.sendStatus(204);
    }
    return res.sendStatus(404);
  }
}

export default UserController;
