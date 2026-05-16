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
    walletCreatedAt: { type: Date, default: null },
    balance: { type: Number, default: 0 },
    activePackage: { type: String, default: "" },
    dailyEarnings: { type: Number, default: 0 },
    referralEarnings: { type: Number, default: 0 },
    totalInvested: { type: Number, default: 0 },
    totalDeposited: { type: Number, default: 0 },
    totalWithdrawn: { type: Number, default: 0 },
    totalProfit: { type: Number, default: 0 },
    pendingWithdrawal: { type: Number, default: 0 },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      index: true,
    },
  },
  { timestamps: true }
);

userSchema.methods.toPublicJSON = function toPublicJSON() {
  const referrer =
    this.referredBy &&
    typeof this.referredBy === "object" &&
    this.referredBy.username
      ? {
          username: this.referredBy.username,
          referralCode: this.referredBy.referralCode,
        }
      : undefined;

  return {
    id: this._id.toString(),
    username: this.username,
    email: this.email,
    referralCode: this.referralCode,
    referrer,
    isVerified: this.isVerified,
    balance: this.balance,
    activePackage: this.activePackage || "",
    dailyEarnings: this.dailyEarnings ?? 0,
    referralEarnings: this.referralEarnings ?? 0,
    totalInvested: this.totalInvested ?? 0,
    totalDeposited: this.totalDeposited ?? 0,
    totalWithdrawn: this.totalWithdrawn ?? 0,
    totalProfit: this.totalProfit ?? 0,
    pendingWithdrawal: this.pendingWithdrawal ?? 0,
    wallet: this.isVerified
      ? {
          bep20Address: this.wallet?.bep20Address || "",
          trc20Address: this.wallet?.trc20Address || "",
          networks: ["USDT_TRC20", "USDT_BEP20"],
        }
      : undefined,
    walletCreatedAt: this.walletCreatedAt || null,
    createdAt: this.createdAt,
  };
};

export default mongoose.models.User || mongoose.model("User", userSchema);
