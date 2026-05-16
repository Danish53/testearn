import mongoose from "mongoose";

const depositSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    network: { type: String, enum: ["trc20", "bep20"], required: true },
    txHash: { type: String, required: true },
    fromAddress: { type: String, default: "" },
    toAddress: { type: String, required: true },
    amount: { type: Number, required: true },
    confirmations: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "credited", "below_minimum"],
      default: "pending",
    },
    blockTime: { type: Date, default: null },
    creditedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

depositSchema.index({ network: 1, txHash: 1 }, { unique: true });
depositSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Deposit || mongoose.model("Deposit", depositSchema);
