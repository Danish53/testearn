/** Map Deposit document to history table row. */
export function depositToHistoryRow(d) {
  const when = d.creditedAt || d.blockTime || d.createdAt;
  const dateObj = when ? new Date(when) : new Date();
  const networkLabel = d.network === "trc20" ? "TRC20" : "BEP20";

  const statusMap = {
    credited: "credited",
    confirmed: "confirming",
    pending: "pending",
    below_minimum: "rejected",
  };

  return {
    id: d.id,
    type: "deposit",
    date: dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    time: dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    label: `USDT Deposit · ${networkLabel}`,
    network: networkLabel,
    amount: d.status === "credited" ? d.amount : d.status === "below_minimum" ? 0 : d.amount,
    status: statusMap[d.status] || d.status,
    txHash: d.txHash ? `${d.txHash.slice(0, 8)}…${d.txHash.slice(-6)}` : "—",
    sortAt: dateObj.getTime(),
  };
}
