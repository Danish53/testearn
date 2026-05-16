import mongoose from "mongoose";

const withdrawalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    network: { type: String, enum: ["trc20", "bep20"], required: true },
    amount: { type: Number, required: true },
    fee: { type: Number, required: true },
    receiveAmount: { type: Number, required: true },
    toAddress: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "processing", "completed", "rejected", "failed"],
      default: "pending",
    },
    txHash: { type: String, default: "" },
    failReason: { type: String, default: "" },
    approvedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

withdrawalSchema.index({ userId: 1, createdAt: -1 });
withdrawalSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Withdrawal ||
  mongoose.model("Withdrawal", withdrawalSchema);
