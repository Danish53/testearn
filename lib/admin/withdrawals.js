import { connectDB } from "@/lib/mongodb";
import { formatWithdrawalAdmin } from "@/lib/admin/format-withdrawal-admin";
import Withdrawal from "@/models/Withdrawal";

export async function listAdminWithdrawals({
  status = "pending",
  page = 1,
  limit = 20,
}) {
  await connectDB();

  const filter = {};
  if (status && status !== "all") {
    filter.status = status;
  }

  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (safePage - 1) * safeLimit;

  const [rows, total, pendingCount] = await Promise.all([
    Withdrawal.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .populate("userId", "username email balance")
      .lean(),
    Withdrawal.countDocuments(filter),
    Withdrawal.countDocuments({ status: "pending" }),
  ]);

  return {
    withdrawals: rows.map((w) => formatWithdrawalAdmin(w, w.userId)),
    pendingCount,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      pages: Math.ceil(total / safeLimit) || 1,
    },
  };
}
