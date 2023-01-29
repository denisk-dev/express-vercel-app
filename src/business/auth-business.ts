import bcrypt from "bcrypt";
import { queryRepo } from "../repositories/query-repo";
import { jwtService } from "../application/jwt-service";

// CUD only
export const authBusinessLogicLayer = {
  async login(loginOrEmail: string, password: string) {
    const result = await queryRepo.findUser(loginOrEmail);

    if (result) {
      const isValid = await bcrypt.compare(password, result.password);

      if (isValid) {
        const token = jwtService.createJWT(result);

        return token;
      }
    }

    return false;
  },
};

export default authBusinessLogicLayer;
