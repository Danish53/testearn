import mongoose from "mongoose";

const milestoneSchema = new mongoose.Schema(
  {
    directReferrals: { type: Number, required: true, min: 1 },
    bonusAmount: { type: Number, required: true, min: 0 },
    label: { type: String, default: "" },
  },
  { _id: true }
);

const referralSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "global", unique: true },
    commissionEnabled: { type: Boolean, default: true },
    maxLevels: { type: Number, default: 3, min: 1, max: 3 },
    level1Percent: { type: Number, default: 10, min: 0, max: 100 },
    level2Percent: { type: Number, default: 5, min: 0, max: 100 },
    level3Percent: { type: Number, default: 3, min: 0, max: 100 },
    requireSponsorOnRegister: { type: Boolean, default: false },
    sponsorMustBeVerified: { type: Boolean, default: true },
    commissionOnPackagePurchaseOnly: { type: Boolean, default: true },
    minPackageInvestment: { type: Number, default: 0 },
    bonusesEnabled: { type: Boolean, default: true },
    newUserBonus: { type: Number, default: 0 },
    referrerSignupBonus: { type: Number, default: 0 },
    milestones: { type: [milestoneSchema], default: [] },
  },
  { timestamps: true }
);

referralSettingsSchema.methods.toAdminJSON = function toAdminJSON() {
  return {
    id: this._id.toString(),
    commissionEnabled: this.commissionEnabled,
    maxLevels: this.maxLevels,
    level1Percent: this.level1Percent,
    level2Percent: this.level2Percent,
    level3Percent: this.level3Percent,
    requireSponsorOnRegister: this.requireSponsorOnRegister,
    sponsorMustBeVerified: this.sponsorMustBeVerified,
    commissionOnPackagePurchaseOnly: this.commissionOnPackagePurchaseOnly,
    minPackageInvestment: this.minPackageInvestment,
    bonusesEnabled: this.bonusesEnabled,
    newUserBonus: this.newUserBonus,
    referrerSignupBonus: this.referrerSignupBonus,
    milestones: (this.milestones || []).map((m) => ({
      id: m._id?.toString(),
      directReferrals: m.directReferrals,
      bonusAmount: m.bonusAmount,
      label: m.label || "",
    })),
    updatedAt: this.updatedAt,
  };
};

referralSettingsSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    commissionEnabled: this.commissionEnabled,
    maxLevels: this.maxLevels,
    levels: [
      { level: 1, label: "Direct (L1)", percent: this.level1Percent },
      { level: 2, label: "Indirect (L2)", percent: this.level2Percent },
      { level: 3, label: "Indirect (L3)", percent: this.level3Percent },
    ],
    requireSponsorOnRegister: this.requireSponsorOnRegister,
  };
};

export default mongoose.models.ReferralSettings ||
  mongoose.model("ReferralSettings", referralSettingsSchema);
