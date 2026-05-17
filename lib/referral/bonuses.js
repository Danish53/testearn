import { connectDB } from "@/lib/mongodb";
import { getReferralSettings } from "@/lib/referral/settings";
import User from "@/models/User";

/** Credit signup-related bonuses when a referred user verifies. */
export async function applyVerificationBonuses(newUser) {
  const settings = await getReferralSettings();
  if (!settings.bonusesEnabled) return { applied: [] };

  const applied = [];
  await connectDB();

  if (settings.newUserBonus > 0) {
    newUser.balance = (newUser.balance || 0) + settings.newUserBonus;
    await newUser.save();
    applied.push({ type: "new_user", amount: settings.newUserBonus, userId: newUser._id.toString() });
  }

  if (!newUser.referredBy) {
    return { applied };
  }

  const referrer = await User.findById(newUser.referredBy);
  if (!referrer?.isVerified) {
    return { applied };
  }

  if (settings.referrerSignupBonus > 0) {
    referrer.balance = (referrer.balance || 0) + settings.referrerSignupBonus;
    referrer.referralEarnings = (referrer.referralEarnings || 0) + settings.referrerSignupBonus;
    await referrer.save();
    applied.push({
      type: "referrer_signup",
      amount: settings.referrerSignupBonus,
      userId: referrer._id.toString(),
    });
  }

  const directCount = await User.countDocuments({
    referredBy: referrer._id,
    isVerified: true,
  });

  for (const m of settings.milestones || []) {
    if (directCount === m.directReferrals && m.bonusAmount > 0) {
      referrer.balance = (referrer.balance || 0) + m.bonusAmount;
      referrer.referralEarnings = (referrer.referralEarnings || 0) + m.bonusAmount;
      await referrer.save();
      applied.push({
        type: "milestone",
        amount: m.bonusAmount,
        userId: referrer._id.toString(),
        label: m.label || `${m.directReferrals} referrals`,
      });
    }
  }

  return { applied };
}
