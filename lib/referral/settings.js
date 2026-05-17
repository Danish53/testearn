import { connectDB } from "@/lib/mongodb";
import { DEFAULT_REFERRAL_SETTINGS } from "@/lib/referral/settings-defaults";
import ReferralSettings from "@/models/ReferralSettings";

export async function getReferralSettings() {
  await connectDB();
  let doc = await ReferralSettings.findOne({ key: "global" });
  if (!doc) {
    doc = await ReferralSettings.create({ key: "global", ...DEFAULT_REFERRAL_SETTINGS });
  }
  return doc;
}

export function percentForLevel(settings, level) {
  if (level === 1) return settings.level1Percent;
  if (level === 2) return settings.level2Percent;
  if (level === 3) return settings.level3Percent;
  return 0;
}

export async function updateReferralSettings(body) {
  await connectDB();
  const doc = await getReferralSettings();

  if (body.commissionEnabled !== undefined) {
    doc.commissionEnabled = Boolean(body.commissionEnabled);
  }
  if (body.maxLevels !== undefined) {
    doc.maxLevels = Math.min(3, Math.max(1, Number(body.maxLevels) || 3));
  }
  for (const key of ["level1Percent", "level2Percent", "level3Percent"]) {
    if (body[key] !== undefined) {
      const n = Number(body[key]);
      if (!Number.isFinite(n) || n < 0 || n > 100) {
        return { ok: false, message: `${key} must be between 0 and 100` };
      }
      doc[key] = n;
    }
  }
  if (body.requireSponsorOnRegister !== undefined) {
    doc.requireSponsorOnRegister = Boolean(body.requireSponsorOnRegister);
  }
  if (body.sponsorMustBeVerified !== undefined) {
    doc.sponsorMustBeVerified = Boolean(body.sponsorMustBeVerified);
  }
  if (body.commissionOnPackagePurchaseOnly !== undefined) {
    doc.commissionOnPackagePurchaseOnly = Boolean(body.commissionOnPackagePurchaseOnly);
  }
  if (body.minPackageInvestment !== undefined) {
    doc.minPackageInvestment = Math.max(0, Number(body.minPackageInvestment) || 0);
  }
  if (body.bonusesEnabled !== undefined) {
    doc.bonusesEnabled = Boolean(body.bonusesEnabled);
  }
  if (body.newUserBonus !== undefined) {
    doc.newUserBonus = Math.max(0, Number(body.newUserBonus) || 0);
  }
  if (body.referrerSignupBonus !== undefined) {
    doc.referrerSignupBonus = Math.max(0, Number(body.referrerSignupBonus) || 0);
  }
  if (body.milestones !== undefined && Array.isArray(body.milestones)) {
    doc.milestones = body.milestones
      .map((m) => ({
        directReferrals: Math.max(1, parseInt(m.directReferrals, 10) || 0),
        bonusAmount: Math.max(0, Number(m.bonusAmount) || 0),
        label: String(m.label || "").trim(),
      }))
      .filter((m) => m.directReferrals > 0)
      .sort((a, b) => a.directReferrals - b.directReferrals);
  }

  await doc.save();
  return { ok: true, settings: doc };
}
