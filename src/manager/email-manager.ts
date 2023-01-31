import { emailAdapter } from "../adapters/email-adapter";
import { TAddUser } from "../types/types";

export const emailManager = {
  async sendRecoveryMessage(user: TAddUser) {
    await emailAdapter.sendEmail(
      user.accountData.email,
      "password recovery",
      `<h1>Thank for your registration</h1><p>To finish registration please follow the link below:<a href='https://somesite.com/confirm-email?code=${user.emailConfirmation.confirmationCode}'>complete registration</a></p>`
    );
  },
};

export default emailManager;
