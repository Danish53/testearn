/** Daily profit interval — 24 hours from activation or last payout. */
export const PROFIT_CYCLE_MS =
  (Number(process.env.PROFIT_CYCLE_HOURS) || 24) * 60 * 60 * 1000;

export function getProfitAnchorDate(investment) {
  if (investment.lastProfitAt) {
    return new Date(investment.lastProfitAt);
  }
  return new Date(investment.activatedAt || investment.createdAt);
}

/** When the next profit payout is due. */
export function getNextProfitAt(investment, now = new Date()) {
  const anchor = getProfitAnchorDate(investment);
  return new Date(anchor.getTime() + PROFIT_CYCLE_MS);
}

export function isProfitDue(investment, now = new Date()) {
  return now.getTime() >= getNextProfitAt(investment, now).getTime();
}

export function profitSchedulePayload(investment, now = new Date()) {
  const next = getNextProfitAt(investment, now);
  const msRemaining = Math.max(0, next.getTime() - now.getTime());
  return {
    nextProfitAt: next.toISOString(),
    profitDue: msRemaining <= 0,
    secondsRemaining: Math.ceil(msRemaining / 1000),
    cycleHours: PROFIT_CYCLE_MS / (60 * 60 * 1000),
  };
}

export function formatInvestmentClient(inv) {
  const schedule = profitSchedulePayload(inv);
  return {
    id: inv._id.toString(),
    packageId: inv.packageId,
    packageName: inv.packageName,
    level: inv.level,
    investment: inv.investment,
    dailyProfit: inv.dailyProfit,
    totalProfitPaid: inv.totalProfitPaid ?? 0,
    activatedAt: inv.activatedAt,
    lastProfitAt: inv.lastProfitAt,
    ...schedule,
  };
}
