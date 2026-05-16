import { connectDB } from "@/lib/mongodb";
import Investment from "@/models/Investment";
import ProfitLog from "@/models/ProfitLog";
import User from "@/models/User";

function startOfUtcDay(date = new Date()) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/** Credit one daily profit per active investment if not yet paid today (UTC). */
export async function accrueDailyProfits(userId) {
  await connectDB();

  const user = await User.findById(userId);
  if (!user) {
    return { credited: 0, entries: [] };
  }

  const investments = await Investment.find({ userId, status: "active" });
  const todayStart = startOfUtcDay();
  const entries = [];
  let totalCredited = 0;

  for (const inv of investments) {
    const last = inv.lastProfitAt ? startOfUtcDay(inv.lastProfitAt) : null;
    if (last && last.getTime() >= todayStart.getTime()) {
      continue;
    }

    try {
      await ProfitLog.create({
        userId,
        investmentId: inv._id,
        packageId: inv.packageId,
        packageName: inv.packageName,
        amount: inv.dailyProfit,
        profitDate: todayStart,
      });
    } catch (err) {
      if (err.code === 11000) continue;
      throw err;
    }

    user.balance = (user.balance || 0) + inv.dailyProfit;
    user.totalProfit = (user.totalProfit || 0) + inv.dailyProfit;
    inv.lastProfitAt = new Date();
    inv.totalProfitPaid = (inv.totalProfitPaid || 0) + inv.dailyProfit;
    await inv.save();

    totalCredited += inv.dailyProfit;
    entries.push({
      packageName: inv.packageName,
      amount: inv.dailyProfit,
    });
  }

  const activeInvestments = await Investment.find({ userId, status: "active" });
  user.dailyEarnings = activeInvestments.reduce((s, i) => s + i.dailyProfit, 0);
  if (activeInvestments.length > 0) {
    const top = activeInvestments.sort((a, b) => b.level - a.level)[0];
    user.activePackage = top.packageName;
  } else {
    user.activePackage = "";
  }

  await user.save();

  return {
    credited: totalCredited,
    entries,
    user: await User.findById(userId),
  };
}
