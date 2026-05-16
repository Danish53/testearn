import mongoose from "mongoose";

const profitLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    investmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Investment",
      required: true,
    },
    packageId: { type: String, required: true },
    packageName: { type: String, required: true },
    amount: { type: Number, required: true },
    profitDate: { type: Date, required: true },
  },
  { timestamps: true }
);

profitLogSchema.index({ userId: 1, createdAt: -1 });
profitLogSchema.index({ investmentId: 1, profitDate: 1 }, { unique: true });

export default mongoose.models.ProfitLog || mongoose.model("ProfitLog", profitLogSchema);
