import mongoose from "mongoose";

const walletAlertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    network: { type: String, enum: ["trc20", "bep20"], required: true },
    alertType: {
      type: String,
      enum: ["wrong_bnb", "wrong_token", "below_minimum"],
      required: true,
    },
    txHash: { type: String, required: true },
    assetSymbol: { type: String, default: "" },
    amount: { type: Number, default: 0 },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

walletAlertSchema.index({ userId: 1, txHash: 1, alertType: 1 }, { unique: true });
walletAlertSchema.index({ userId: 1, read: 1, createdAt: -1 });

export default mongoose.models.WalletAlert ||
  mongoose.model("WalletAlert", walletAlertSchema);
