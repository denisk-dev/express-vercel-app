import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { TUsers } from "../types/types";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "my-32-character-ultra-secure-and-ultra-long-secret";

export const jwtService = {
  // TODO fix user
  createJWT(user: TUsers & { _id: ObjectId }) {
    // eslint-disable-next-line no-underscore-dangle
    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: "17h",
    });
    return token;
  },

  getUserIdByToken(token: string) {
    try {
      const result: any = jwt.verify(token, JWT_SECRET);

      return result.id;
    } catch (error) {
      return null;
    }
  },
};

export default jwtService;
