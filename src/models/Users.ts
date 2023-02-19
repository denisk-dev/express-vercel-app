import mongoose from "mongoose";

const { Schema } = mongoose;

const pwdRecoveryDataSchema = new Schema(
  {
    recoveryCode: { type: String },
  },
  { _id: false }
);

const accountDataSchema = new Schema(
  {
    userName: { type: String, required: true },
    email: { type: String, required: true },
    passwordHash: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const emailConfirmationDataSchema = new Schema(
  {
    confirmationCode: { type: String, required: true },
    isConfirmed: { type: Boolean, required: true },
    expirationDate: { type: Date, required: true },
  },
  { _id: false }
);

const refreshTokensMetaDataSchema = new Schema(
  {
    deviceId: { type: String, required: true },
    ip: { type: String, required: true },
    title: { type: String, required: true },
    lastActiveDate: { type: Date, required: true },
  },
  { _id: false }
);

const usersSchema = new Schema(
  {
    accountData: { type: accountDataSchema, required: true },
    emailConfirmation: { type: emailConfirmationDataSchema, required: true },
    passwordRecovery: { type: pwdRecoveryDataSchema },
    refreshTokensMeta: { type: [refreshTokensMetaDataSchema] },
  },
  { versionKey: false }
);

const UsersSchema = mongoose.model("users", usersSchema);

export default UsersSchema;
