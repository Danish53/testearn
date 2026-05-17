import { connectDB } from "@/lib/mongodb";
import { formatDepositAdmin } from "@/lib/admin/format-deposit-admin";
import Deposit from "@/models/Deposit";
import User from "@/models/User";

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function buildSearchFilter(baseFilter, trimmed) {
  if (!trimmed) return baseFilter;

  const rx = new RegExp(escapeRegex(trimmed), "i");
  const matchingUsers = await User.find({
    $or: [{ email: rx }, { username: rx }],
  }).select("_id");
  const userIds = matchingUsers.map((u) => u._id);

  const { $or: _drop, ...rest } = baseFilter;
  return {
    ...rest,
    $or: [
      { txHash: rx },
      { toAddress: rx },
      { fromAddress: rx },
      ...(userIds.length ? [{ userId: { $in: userIds } }] : []),
    ],
  };
}

export async function listAdminDeposits({
  q = "",
  status = "all",
  network = "all",
  page = 1,
  limit = 20,
}) {
  await connectDB();

  const baseFilter = {};
  const trimmed = String(q || "").trim();

  if (status !== "all") {
    baseFilter.status = status;
  }
  if (network === "trc20" || network === "bep20") {
    baseFilter.network = network;
  }

  const filter = await buildSearchFilter(baseFilter, trimmed);

  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (safePage - 1) * safeLimit;
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [deposits, total, summaryAgg, credited24h] = await Promise.all([
    Deposit.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .populate("userId", "username email")
      .lean(),
    Deposit.countDocuments(filter),
    Deposit.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          total: { $sum: "$amount" },
        },
      },
    ]),
    Deposit.aggregate([
      { $match: { status: "credited", creditedAt: { $gte: dayAgo } } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
  ]);

  const summary = {
    credited: { count: 0, totalUsd: 0 },
    pending: { count: 0, totalUsd: 0 },
    confirmed: { count: 0, totalUsd: 0 },
    below_minimum: { count: 0, totalUsd: 0 },
    failed: { count: 0, totalUsd: 0 },
  };
  for (const row of summaryAgg) {
    if (summary[row._id]) {
      summary[row._id].count = row.count;
      summary[row._id].totalUsd = row.total;
    }
  }

  return {
    deposits: deposits.map((d) => formatDepositAdmin(d, d.userId)),
    summary: {
      ...summary,
      last24hCreditedUsd: credited24h[0]?.total ?? 0,
      last24hCreditedCount: credited24h[0]?.count ?? 0,
    },
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      pages: Math.ceil(total / safeLimit) || 1,
    },
  };
}
