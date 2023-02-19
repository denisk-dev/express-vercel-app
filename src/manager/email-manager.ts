import { emailAdapter } from "../adapters/email-adapter";
// import { TAddUser } from "../types/types";

export const emailManager = {
  async sendRecoveryMessage(user: any) {
    await emailAdapter.sendEmail(
      user.accountData.email,
      "password recovery",
      `<h1>Thank for your registration</h1><p>To finish registration please follow the link below:<a href='https://somesite.com/confirm-email?code=${user.emailConfirmation.confirmationCode}'>complete registration</a></p>`
    );
  },

  async sendPasswordRecoveryMessage(email: string, recoveryCode: string) {
    await emailAdapter.sendEmail(
      email,
      "password recovery",
      `<h1>Password recovery</h1><p>To finish password recovery please follow the link below:<a href='https://somesite.com/password-recovery?recoveryCode=${recoveryCode}'>recovery password</a></p>`
    );
  },
};

export default emailManager;
