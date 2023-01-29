import { TUsers } from "./src/types/types";

declare global {
  declare namespace Express {
    export interface Request {
      context: { user: TUsers };
    }
  }
}
