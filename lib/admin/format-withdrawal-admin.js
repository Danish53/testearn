export function withdrawalStatusLabel(status) {
  const map = {
    pending: "Pending — send USDT manually",
    approved: "Approved",
    processing: "Processing on-chain",
    completed: "Completed",
    rejected: "Rejected",
    failed: "Failed",
  };
  return map[status] || status;
}

export function formatWithdrawalAdmin(w, user) {
  const u = user || w.userId;
  return {
    id: String(w._id),
    userId: String(w.userId?._id || w.userId),
    username: u?.username || "—",
    email: u?.email || "—",
    network: w.network,
    networkLabel: w.network === "trc20" ? "TRC20 (Tron)" : "BEP20 (BSC)",
    amount: w.amount,
    fee: w.fee,
    receiveAmount: w.receiveAmount,
    toAddress: w.toAddress,
    status: w.status,
    statusLabel: withdrawalStatusLabel(w.status),
    txHash: w.txHash || "",
    failReason: w.failReason || "",
    approvedAt: w.approvedAt || null,
    completedAt: w.completedAt || null,
    createdAt: w.createdAt,
  };
}
