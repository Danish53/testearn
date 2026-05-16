import { connectDB } from "@/lib/mongodb";
import Commission from "@/models/Commission";
import User from "@/models/User";

/** Walk up to 3 upline referrers. */
export async function getUplineChain(userId, maxLevels = 3) {
  await connectDB();
  const chain = [];
  let current = await User.findById(userId).select("referredBy");

  while (current?.referredBy && chain.length < maxLevels) {
    const referrer = await User.findById(current.referredBy);
    if (!referrer?.isVerified) break;
    chain.push({ referrer, level: chain.length + 1 });
    current = referrer;
  }

  return chain;
}

/**
 * Pay L1 direct %, L2–L3 indirect % on VIP package purchase.
 */
export async function distributePackageCommissions(buyer, pkg) {
  const chain = await getUplineChain(buyer._id, 3);
  const paid = [];

  for (const { referrer, level } of chain) {
    const percent = level === 1 ? pkg.directPercent : pkg.indirectPercent;
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

    paid.push({ level, amount, referrerId: referrer._id.toString() });
  }

  return paid;
}
