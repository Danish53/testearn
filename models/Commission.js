import mongoose from "mongoose";

const commissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    level: { type: Number, enum: [1, 2, 3], required: true },
    packageId: { type: String, required: true },
    packageName: { type: String, required: true },
    investmentAmount: { type: Number, required: true },
    percent: { type: Number, required: true },
    amount: { type: Number, required: true },
  },
  { timestamps: true }
);

commissionSchema.index({ userId: 1, createdAt: -1 });
commissionSchema.index({ userId: 1, level: 1 });

export default mongoose.models.Commission ||
  mongoose.model("Commission", commissionSchema);
