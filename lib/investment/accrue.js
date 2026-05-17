import { connectDB } from "@/lib/mongodb";
import {
  getNextProfitAt,
  isProfitDue,
  profitSchedulePayload,
} from "@/lib/investment/profit-schedule";
import Investment from "@/models/Investment";
import ProfitLog from "@/models/ProfitLog";
import User from "@/models/User";

/** Credit daily profit per active plan after each 24h cycle. */
export async function accrueDailyProfits(userId) {
  await connectDB();

  const user = await User.findById(userId);
  if (!user) {
    return { credited: 0, entries: [] };
  }

  const investments = await Investment.find({ userId, status: "active" });
  const now = new Date();
  const entries = [];
  let totalCredited = 0;

  for (const inv of investments) {
    if (!isProfitDue(inv, now)) {
      continue;
    }

    const periodDue = getNextProfitAt(inv, now);

    try {
      await ProfitLog.create({
        userId,
        investmentId: inv._id,
        packageId: inv.packageId,
        packageName: inv.packageName,
        amount: inv.dailyProfit,
        profitDate: periodDue,
      });
    } catch (err) {
      if (err.code === 11000) {
        inv.lastProfitAt = inv.lastProfitAt || new Date();
        await inv.save();
        continue;
      }
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
      nextProfitAt: profitSchedulePayload(inv).nextProfitAt,
    });
  }

  const activeInvestments = await Investment.find({ userId, status: "active" });
  user.dailyEarnings = activeInvestments.reduce((s, i) => s + i.dailyProfit, 0);
  if (activeInvestments.length > 0) {
    const top = [...activeInvestments].sort((a, b) => b.level - a.level)[0];
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

/** Cron: accrue profits for every user with active investments. */
export async function accrueAllUsersProfits() {
  await connectDB();
  const userIds = await Investment.distinct("userId", { status: "active" });
  let totalCredited = 0;
  let usersCredited = 0;

  for (const userId of userIds) {
    const result = await accrueDailyProfits(userId);
    if (result.credited > 0) {
      totalCredited += result.credited;
      usersCredited += 1;
    }
  }

  return {
    usersChecked: userIds.length,
    usersCredited,
    totalCredited,
  };
}
