export function depositStatusLabel(status) {
  const map = {
    credited: "Credited to balance",
    confirmed: "Confirmed on-chain",
    pending: "Pending confirmations",
    below_minimum: "Below minimum ($10)",
    failed: "Failed / dropped",
  };
  return map[status] || status;
}

export function formatDepositAdmin(d, user) {
  const u = user || d.userId;
  return {
    id: String(d._id),
    userId: String(d.userId?._id || d.userId),
    username: u?.username || "—",
    email: u?.email || "—",
    network: d.network,
    networkLabel: d.network === "trc20" ? "TRC20" : "BEP20",
    txHash: d.txHash,
    fromAddress: d.fromAddress || "",
    toAddress: d.toAddress,
    amount: d.amount,
    confirmations: d.confirmations ?? 0,
    status: d.status,
    statusLabel: depositStatusLabel(d.status),
    blockTime: d.blockTime || null,
    creditedAt: d.creditedAt || null,
    failReason: d.failReason || "",
    lastCheckedAt: d.lastCheckedAt || null,
    createdAt: d.createdAt,
  };
}
