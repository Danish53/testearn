export function commissionToHistoryRow(c) {
  const dateObj = new Date(c.createdAt);
  return {
    id: `ref-${c.id}`,
    type: "referral",
    date: dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    time: dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    label: `L${c.level} commission · @${c.fromUsername}`,
    network: c.packageName,
    amount: c.amount,
    status: "credited",
    txHash: `${c.percent}% of $${c.investmentAmount}`,
    sortAt: dateObj.getTime(),
  };
}
