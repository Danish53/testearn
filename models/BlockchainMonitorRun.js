import mongoose from "mongoose";

const blockchainMonitorRunSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["running", "completed", "failed"],
      default: "running",
    },
    trigger: { type: String, enum: ["cron", "admin", "system"], default: "cron" },
    usersScanned: { type: Number, default: 0 },
    depositsDetected: { type: Number, default: 0 },
    depositsCredited: { type: Number, default: 0 },
    creditedUsd: { type: Number, default: 0 },
    confirmationsUpdated: { type: Number, default: 0 },
    failedMarked: { type: Number, default: 0 },
    durationMs: { type: Number, default: 0 },
    error: { type: String, default: "" },
  },
  { timestamps: true }
);

blockchainMonitorRunSchema.index({ createdAt: -1 });

blockchainMonitorRunSchema.methods.toJSON = function toJSON() {
  return {
    id: this._id.toString(),
    status: this.status,
    trigger: this.trigger,
    usersScanned: this.usersScanned,
    depositsDetected: this.depositsDetected,
    depositsCredited: this.depositsCredited,
    creditedUsd: this.creditedUsd,
    confirmationsUpdated: this.confirmationsUpdated,
    failedMarked: this.failedMarked,
    durationMs: this.durationMs,
    error: this.error || "",
    createdAt: this.createdAt,
    finishedAt: this.updatedAt,
  };
};

export default mongoose.models.BlockchainMonitorRun ||
  mongoose.model("BlockchainMonitorRun", blockchainMonitorRunSchema);
