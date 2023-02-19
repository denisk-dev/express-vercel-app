import jwt from "jsonwebtoken";
// import { ObjectId } from "mongodb";
// import { TAddUser } from "../types/types";

// const JWT_SECRET =
//   process.env.JWT_SECRET ||
//   "my-32-character-ultra-secure-and-ultra-long-secret";

export const jwtService = {
  // TODO fix user
  createJWT(user: any, time: string, JWT_SECRET: string) {
    // eslint-disable-next-line no-underscore-dangle
    const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET, {
      expiresIn: time,
    });
    return token;
  },
  createJWTrefresh(
    user: { _id: any; deviceId: string },
    time: string,
    JWT_SECRET: string
  ) {
    // eslint-disable-next-line no-underscore-dangle
    const token = jwt.sign(
      // eslint-disable-next-line no-underscore-dangle
      { id: user._id, deviceId: user.deviceId },
      JWT_SECRET,
      {
        expiresIn: time,
      }
    );
    return token;
  },

  getUserIdByToken(token: string) {
    try {
      const result: any = jwt.verify(
        token,
        "my-32-character-ultra-secure-and-ultra-long-secret"
      );

      return result.id;
    } catch (error) {
      return null;
    }
  },
};

export default jwtService;
