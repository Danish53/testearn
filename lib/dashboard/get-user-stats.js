import { getReferralTeam } from "@/lib/referral/team";

export async function buildDashboardStats(user) {
  const team = await getReferralTeam(user._id);
  const teamLevels = team.levels;
  const teamCount = team.teamSize;

  const totalBalance = user.balance ?? 0;
  const totalDeposited = user.totalDeposited ?? 0;
  const totalWithdrawn = user.totalWithdrawn ?? 0;
  const pendingWithdrawal = user.pendingWithdrawal ?? 0;

  return {
    features: {
      totalBalance,
      activePackage: user.activePackage?.trim() || "None",
      dailyEarnings: user.dailyEarnings ?? 0,
      referralEarnings: team.referralEarnings ?? user.referralEarnings ?? 0,
      teamCount,
      depositSummary: {
        total: totalDeposited,
        count: totalDeposited > 0 ? 1 : 0,
        pending: 0,
      },
      withdrawalSummary: {
        total: totalWithdrawn,
        count: totalWithdrawn > 0 ? 1 : 0,
        pending: pendingWithdrawal,
      },
    },
    cards: {
      currentBalance: totalBalance,
      totalInvested: user.totalInvested ?? 0,
      totalWithdrawn,
      totalProfit: user.totalProfit ?? 0,
      teamLevels: teamLevels.filter((l) => l.count > 0).length,
    },
    teamLevels,
  };
}
