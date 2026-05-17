import { connectDB } from "@/lib/mongodb";
import { formatDepositAdmin } from "@/lib/admin/format-deposit-admin";
import { formatWithdrawalAdmin } from "@/lib/admin/format-withdrawal-admin";
import Deposit from "@/models/Deposit";
import Withdrawal from "@/models/Withdrawal";
import User from "@/models/User";

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function userIdsForSearch(trimmed) {
  if (!trimmed) return null;
  const rx = new RegExp(escapeRegex(trimmed), "i");
  const users = await User.find({
    $or: [{ email: rx }, { username: rx }],
  }).select("_id");
  return users.map((u) => u._id);
}

function buildDepositFilter({ status, network, q, userIds }) {
  const filter = {};
  if (status === "failed") {
    filter.status = "failed";
  } else if (status === "credited") {
    filter.status = "credited";
  } else if (status === "pending") {
    filter.status = { $in: ["pending", "confirmed"] };
  } else if (status === "completed") {
    filter._id = { $exists: false };
  } else if (status && status !== "all") {
    filter.status = status;
  }
  if (network === "trc20" || network === "bep20") {
    filter.network = network;
  }
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter.$or = [
      { txHash: rx },
      { toAddress: rx },
      { fromAddress: rx },
      ...(userIds?.length ? [{ userId: { $in: userIds } }] : []),
    ];
  }
  return filter;
}

function buildWithdrawFilter({ status, network, q, userIds }) {
  const filter = {};
  if (status === "failed") {
    filter.status = "failed";
  } else if (status === "completed") {
    filter.status = "completed";
  } else if (status === "credited") {
    filter._id = { $exists: false };
  } else if (status === "pending") {
    filter.status = "pending";
  } else if (status && status !== "all") {
    filter.status = status;
  }
  if (network === "trc20" || network === "bep20") {
    filter.network = network;
  }
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter.$or = [
      { txHash: rx },
      { toAddress: rx },
      ...(userIds?.length ? [{ userId: { $in: userIds } }] : []),
    ];
  }
  return filter;
}

function toHistoryItem(type, row, user) {
  if (type === "deposit") {
    const d = formatDepositAdmin(row, user);
    return {
      type: "deposit",
      id: d.id,
      userId: d.userId,
      username: d.username,
      email: d.email,
      network: d.network,
      networkLabel: d.networkLabel,
      amount: d.amount,
      status: d.status,
      statusLabel: d.statusLabel,
      txHash: d.txHash,
      toAddress: d.toAddress,
      fromAddress: d.fromAddress,
      confirmations: d.confirmations,
      failReason: row.failReason || "",
      at: d.creditedAt || d.createdAt,
      createdAt: d.createdAt,
    };
  }

  const w = formatWithdrawalAdmin(row, user);
  return {
    type: "withdrawal",
    id: w.id,
    userId: w.userId,
    username: w.username,
    email: w.email,
    network: w.network,
    networkLabel: w.networkLabel,
    amount: w.amount,
    receiveAmount: w.receiveAmount,
    status: w.status,
    statusLabel: w.statusLabel,
    txHash: w.txHash,
    toAddress: w.toAddress,
    failReason: w.failReason || "",
    at: w.completedAt || w.createdAt,
    createdAt: w.createdAt,
  };
}

/** Unified deposit + withdrawal history for admin. */
export async function listBlockchainHistory({
  type = "all",
  status = "all",
  network = "all",
  q = "",
  page = 1,
  limit = 25,
}) {
  await connectDB();

  const trimmed = String(q || "").trim();
  const userIds = await userIdsForSearch(trimmed);
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 25));
  const fetchLimit = safePage * safeLimit;

  const depositFilter = buildDepositFilter({ status, network, q: trimmed, userIds });
  const withdrawFilter = buildWithdrawFilter({ status, network, q: trimmed, userIds });

  const includeDeposits = type !== "withdrawal";
  const includeWithdrawals = type !== "deposit";

  const queries = [];

  if (includeDeposits) {
    queries.push(
      Deposit.find(depositFilter)
        .sort({ createdAt: -1 })
        .limit(fetchLimit)
        .populate("userId", "username email")
        .lean()
    );
  } else {
    queries.push(Promise.resolve([]));
  }

  if (includeWithdrawals) {
    queries.push(
      Withdrawal.find(withdrawFilter)
        .sort({ createdAt: -1 })
        .limit(fetchLimit)
        .populate("userId", "username email")
        .lean()
    );
  } else {
    queries.push(Promise.resolve([]));
  }

  const countQueries = [];
  if (includeDeposits) countQueries.push(Deposit.countDocuments(depositFilter));
  if (includeWithdrawals) countQueries.push(Withdrawal.countDocuments(withdrawFilter));

  const [deposits, withdrawals, ...counts] = await Promise.all([
    ...queries,
    ...countQueries,
  ]);

  const merged = [
    ...deposits.map((d) => toHistoryItem("deposit", d, d.userId)),
    ...withdrawals.map((w) => toHistoryItem("withdrawal", w, w.userId)),
  ].sort((a, b) => new Date(b.at) - new Date(a.at));

  const skip = (safePage - 1) * safeLimit;
  const items = merged.slice(skip, skip + safeLimit);
  const total = counts.reduce((s, n) => s + n, 0);

  const [depositSummary, withdrawSummary, failedDeposits, failedWithdrawals] =
    await Promise.all([
      Deposit.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 }, total: { $sum: "$amount" } } },
      ]),
      Withdrawal.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 }, total: { $sum: "$amount" } } },
      ]),
      Deposit.countDocuments({ status: "failed" }),
      Withdrawal.countDocuments({ status: "failed" }),
    ]);

  const depMap = Object.fromEntries(depositSummary.map((r) => [r._id, r]));
  const wdrMap = Object.fromEntries(withdrawSummary.map((r) => [r._id, r]));

  return {
    items,
    summary: {
      deposits: {
        credited: depMap.credited?.count ?? 0,
        pending: (depMap.pending?.count ?? 0) + (depMap.confirmed?.count ?? 0),
        failed: failedDeposits,
        creditedUsd: depMap.credited?.total ?? 0,
      },
      withdrawals: {
        completed: wdrMap.completed?.count ?? 0,
        pending: wdrMap.pending?.count ?? 0,
        failed: failedWithdrawals,
        completedUsd: wdrMap.completed?.total ?? 0,
      },
    },
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      pages: Math.ceil(total / safeLimit) || 1,
    },
  };
}
