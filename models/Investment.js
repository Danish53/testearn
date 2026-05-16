import mongoose from "mongoose";

const investmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    packageId: { type: String, required: true },
    packageName: { type: String, required: true },
    level: { type: Number, required: true },
    investment: { type: Number, required: true },
    dailyProfit: { type: Number, required: true },
    status: { type: String, enum: ["active", "paused"], default: "active" },
    activatedAt: { type: Date, default: Date.now },
    lastProfitAt: { type: Date, default: null },
    totalProfitPaid: { type: Number, default: 0 },
  },
  { timestamps: true }
);

investmentSchema.index({ userId: 1, status: 1 });

export default mongoose.models.Investment ||
  mongoose.model("Investment", investmentSchema);
