import { connectDB } from "@/lib/mongodb";
import { getPackageById } from "@/lib/investment/packages";
import { distributePackageCommissions } from "@/lib/referral/commissions";
import Investment from "@/models/Investment";
import User from "@/models/User";

export async function purchasePackage(userId, packageId) {
  await connectDB();

  const pkg = getPackageById(packageId);
  if (!pkg) {
    return { ok: false, message: "Invalid package" };
  }

  const user = await User.findById(userId);
  if (!user?.isVerified) {
    return { ok: false, message: "Account not verified" };
  }

  if ((user.balance || 0) < pkg.investment) {
    return {
      ok: false,
      message: `Insufficient balance — need ${pkg.investment} USDT for ${pkg.name}`,
    };
  }

  user.balance = (user.balance || 0) - pkg.investment;
  user.totalInvested = (user.totalInvested || 0) + pkg.investment;
  user.activePackage = pkg.name;

  const investment = await Investment.create({
    userId: user._id,
    packageId: pkg.id,
    packageName: pkg.name,
    level: pkg.level,
    investment: pkg.investment,
    dailyProfit: pkg.dailyProfit,
    status: "active",
    activatedAt: new Date(),
    lastProfitAt: null,
  });

  await user.save();
  await distributePackageCommissions(user, pkg);

  const updatedUser = await User.findById(userId);
  return { ok: true, investment, user: updatedUser, package: pkg };
}
