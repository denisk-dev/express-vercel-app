import { SecurityController } from "../controllers/security-controller";
import { QueryRepository } from "../repositories/query-repo";
import { SecurityBusiness } from "../business/security-business";
import { SecurityRepository } from "../repositories/security-repo";

const securityBusiness = new SecurityBusiness(
  new QueryRepository(),
  new SecurityRepository()
);

export const securityController = new SecurityController(securityBusiness);

export default securityController;
