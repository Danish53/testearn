import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    bep20Address: { type: String, default: "" },
    trc20Address: { type: String, default: "" },
    encryptedPrivateKey: { type: String, default: "" },
    encryptedMnemonic: { type: String, default: "" },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 32,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: { type: String, required: true },
    referralCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isVerified: { type: Boolean, default: false },
    otpHash: { type: String, default: null },
    otpExpiresAt: { type: Date, default: null },
    wallet: { type: walletSchema, default: () => ({}) },
    balance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    username: this.username,
    email: this.email,
    referralCode: this.referralCode,
    isVerified: this.isVerified,
    balance: this.balance,
    wallet: this.isVerified
      ? {
          bep20Address: this.wallet?.bep20Address || "",
          trc20Address: this.wallet?.trc20Address || "",
        }
      : undefined,
    createdAt: this.createdAt,
  };
};

export default mongoose.models.User || mongoose.model("User", userSchema);
