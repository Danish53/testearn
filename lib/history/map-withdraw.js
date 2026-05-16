export function withdrawalToHistoryRow(w) {
  const when = w.completedAt || w.createdAt;
  const dateObj = when ? new Date(when) : new Date();
  const networkLabel = w.network === "trc20" ? "TRC20" : "BEP20";

  const statusMap = {
    completed: "completed",
    processing: "confirming",
    approved: "review",
    pending: "pending",
    rejected: "rejected",
    failed: "rejected",
  };

  const dest = w.toAddress
    ? `${w.toAddress.slice(0, 8)}…${w.toAddress.slice(-6)}`
    : "—";

  return {
    id: w.id,
    type: "withdraw",
    date: dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    time: dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    label: `USDT Withdrawal · ${networkLabel}`,
    network: networkLabel,
    amount: -Math.abs(w.amount),
    status: statusMap[w.status] || w.status,
    txHash: w.txHash ? `${w.txHash.slice(0, 8)}…${w.txHash.slice(-6)}` : dest,
    sortAt: dateObj.getTime(),
  };
}
