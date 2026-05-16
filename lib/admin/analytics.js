import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Deposit from "@/models/Deposit";
import Withdrawal from "@/models/Withdrawal";
import Investment from "@/models/Investment";

function sinceHours(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

export async function getAdminAnalytics() {
  await connectDB();

  const dayAgo = sinceHours(24);
  const weekAgo = sinceHours(24 * 7);

  const [
    totalUsers,
    verifiedUsers,
    newUsers24h,
    depositStats,
    deposits24h,
    withdrawStats,
    withdraws24h,
    pendingWithdrawals,
    investmentStats,
    activeInvestments,
    recentDeposits,
    recentWithdrawals,
    balanceAgg,
    withdrawFees,
  ] = await Promise.all([
    User.countDocuments({ role: { $ne: "admin" } }),
    User.countDocuments({ role: { $ne: "admin" }, isVerified: true }),
    User.countDocuments({ role: { $ne: "admin" }, createdAt: { $gte: dayAgo } }),
    Deposit.aggregate([
      { $match: { status: "credited" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]),
    Deposit.aggregate([
      { $match: { status: "credited", creditedAt: { $gte: dayAgo } } },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]),
    Withdrawal.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]),
    Withdrawal.aggregate([
      { $match: { status: "completed", completedAt: { $gte: dayAgo } } },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]),
    Withdrawal.countDocuments({ status: "pending" }),
    Investment.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$investment" },
          count: { $sum: 1 },
        },
      },
    ]),
    Investment.countDocuments({ status: "active" }),
    Deposit.find({ status: { $in: ["credited", "confirmed", "pending"] } })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate("userId", "username email")
      .lean(),
    Withdrawal.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .populate("userId", "username email")
      .lean(),
    User.aggregate([
      { $match: { role: { $ne: "admin" } } },
      { $group: { _id: null, total: { $sum: "$balance" } } },
    ]),
    Withdrawal.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$fee" } } },
    ]),
  ]);

  const dep = depositStats[0] || { total: 0, count: 0 };
  const dep24 = deposits24h[0] || { total: 0, count: 0 };
  const wdr = withdrawStats[0] || { total: 0, count: 0 };
  const wdr24 = withdraws24h[0] || { total: 0, count: 0 };
  const inv = investmentStats[0] || { total: 0, count: 0 };
  const fees = withdrawFees[0]?.total ?? 0;
  const userBalances = balanceAgg[0]?.total ?? 0;

  const investmentsWeek = await Investment.aggregate([
    { $match: { createdAt: { $gte: weekAgo } } },
    { $group: { _id: null, total: { $sum: "$investment" }, count: { $sum: 1 } } },
  ]);
  const invWeek = investmentsWeek[0] || { total: 0, count: 0 };

  const blockchainActivity = [
    ...recentDeposits.map((d) => ({
      type: "deposit",
      id: d._id.toString(),
      network: d.network,
      amount: d.amount,
      status: d.status,
      txHash: d.txHash,
      user: d.userId?.username || d.userId?.email || "—",
      at: d.creditedAt || d.createdAt,
    })),
    ...recentWithdrawals.map((w) => ({
      type: "withdrawal",
      id: w._id.toString(),
      network: w.network,
      amount: w.amount,
      status: w.status,
      txHash: w.txHash || "",
      user: w.userId?.username || w.userId?.email || "—",
      at: w.completedAt || w.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 12);

  return {
    users: {
      total: totalUsers,
      verified: verifiedUsers,
      new24h: newUsers24h,
    },
    deposits: {
      totalUsd: dep.total,
      count: dep.count,
      last24hUsd: dep24.total,
      last24hCount: dep24.count,
    },
    withdrawals: {
      totalUsd: wdr.total,
      count: wdr.count,
      pending: pendingWithdrawals,
      last24hUsd: wdr24.total,
      last24hCount: wdr24.count,
    },
    investments: {
      totalUsd: inv.total,
      count: inv.count,
      active: activeInvestments,
      last7dUsd: invWeek.total,
      last7dCount: invWeek.count,
    },
    revenue: {
      withdrawFeesUsd: fees,
      userBalancesUsd: userBalances,
      netInflowUsd: Math.round((dep.total - wdr.total) * 100) / 100,
    },
    blockchain: {
      activity: blockchainActivity,
    },
  };
}
