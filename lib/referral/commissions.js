import { connectDB } from "@/lib/mongodb";
import { getReferralSettings, percentForLevel } from "@/lib/referral/settings";
import Commission from "@/models/Commission";
import User from "@/models/User";

/** Walk up to 3 upline referrers. */
export async function getUplineChain(userId, maxLevels = 3) {
  await connectDB();
  const settings = await getReferralSettings();
  const limit = Math.min(maxLevels, settings.maxLevels || 3);

  const chain = [];
  let current = await User.findById(userId).select("referredBy");

  while (current?.referredBy && chain.length < limit) {
    const referrer = await User.findById(current.referredBy);
    if (!referrer) break;
    if (settings.sponsorMustBeVerified && !referrer.isVerified) break;
    chain.push({ referrer, level: chain.length + 1 });
    current = referrer;
  }

  return chain;
}

/**
 * Pay L1–L3 % from admin referral settings on VIP package purchase.
 */
export async function distributePackageCommissions(buyer, pkg) {
  const settings = await getReferralSettings();
  if (!settings.commissionEnabled) return [];

  if (
    settings.minPackageInvestment > 0 &&
    pkg.investment < settings.minPackageInvestment
  ) {
    return [];
  }

  const chain = await getUplineChain(buyer._id, settings.maxLevels);
  const paid = [];

  for (const { referrer, level } of chain) {
    const percent = percentForLevel(settings, level);
    const amount = Math.round((pkg.investment * percent) / 100 * 100) / 100;
    if (amount <= 0) continue;

    referrer.balance = (referrer.balance || 0) + amount;
    referrer.referralEarnings = (referrer.referralEarnings || 0) + amount;
    await referrer.save();

    await Commission.create({
      userId: referrer._id,
      fromUserId: buyer._id,
      level,
      packageId: pkg.id,
      packageName: pkg.name,
      investmentAmount: pkg.investment,
      percent,
      amount,
    });

    paid.push({ level, amount, percent, referrerId: referrer._id.toString() });
  }

  return paid;
}
