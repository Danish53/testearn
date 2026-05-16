export function purchaseToHistoryRow(p) {
  const dateObj = p.activatedAt ? new Date(p.activatedAt) : new Date(p.createdAt);
  return {
    id: `pkg-${p.id}`,
    type: "package",
    date: dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    time: dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    label: `${p.packageName} activated`,
    network: "Wallet",
    amount: -Math.abs(p.amount),
    status: p.status === "active" ? "completed" : p.status,
    txHash: `Plan · $${p.dailyProfit}/day`,
    sortAt: dateObj.getTime(),
  };
}

export function profitToHistoryRow(p) {
  const dateObj = p.profitDate ? new Date(p.profitDate) : new Date(p.createdAt);
  return {
    id: `earn-${p.id}`,
    type: "earning",
    date: dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    time: dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    label: `Daily profit · ${p.packageName}`,
    network: "—",
    amount: p.amount,
    status: "credited",
    txHash: "Daily payout",
    sortAt: dateObj.getTime(),
  };
}
