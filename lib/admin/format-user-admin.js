/** Plain-object safe admin user shape (works with lean docs and Mongoose documents). */
export function formatUserAdmin(u) {
  const referrer =
    u.referredBy &&
    typeof u.referredBy === "object" &&
    u.referredBy.username
      ? {
          id: String(u.referredBy._id || u.referredBy.id || ""),
          username: u.referredBy.username,
          referralCode: u.referredBy.referralCode,
        }
      : null;

  return {
    id: String(u._id),
    username: u.username,
    email: u.email,
    referralCode: u.referralCode,
    role: u.role || "user",
    isVerified: Boolean(u.isVerified),
    isBlocked: Boolean(u.isBlocked),
    blockedAt: u.blockedAt || null,
    balance: u.balance ?? 0,
    activePackage: u.activePackage || "",
    dailyEarnings: u.dailyEarnings ?? 0,
    referralEarnings: u.referralEarnings ?? 0,
    totalInvested: u.totalInvested ?? 0,
    totalDeposited: u.totalDeposited ?? 0,
    totalWithdrawn: u.totalWithdrawn ?? 0,
    totalProfit: u.totalProfit ?? 0,
    pendingWithdrawal: u.pendingWithdrawal ?? 0,
    wallet: {
      bep20Address: u.wallet?.bep20Address || "",
      trc20Address: u.wallet?.trc20Address || "",
      hasWallet: Boolean(u.wallet?.bep20Address && u.wallet?.trc20Address),
      walletCreatedAt: u.walletCreatedAt || null,
    },
    referrer,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}
