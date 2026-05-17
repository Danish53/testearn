import { connectDB } from "@/lib/mongodb";
import {
  BLOCKCHAIN_MONITOR_ENABLED,
  MONITOR_USER_BATCH,
} from "@/lib/blockchain/constants";
import { handleFailedTransactions } from "@/lib/blockchain/handle-failed";
import { refreshPendingDeposits } from "@/lib/blockchain/refresh-pending";
import { processUserDeposits } from "@/lib/deposit/process";
import BlockchainMonitorRun from "@/models/BlockchainMonitorRun";
import User from "@/models/User";

/** Scan all user wallets for incoming USDT (TRC20 + BEP20). */
export async function scanAllUserDeposits() {
  await connectDB();

  const users = await User.find({
    role: { $ne: "admin" },
    isBlocked: { $ne: true },
    $or: [
      { "wallet.trc20Address": { $exists: true, $nin: ["", null] } },
      { "wallet.bep20Address": { $exists: true, $nin: ["", null] } },
    ],
  })
    .limit(MONITOR_USER_BATCH)
    .sort({ updatedAt: -1 });

  let depositsDetected = 0;
  let depositsCredited = 0;
  let creditedUsd = 0;

  for (const user of users) {
    try {
      const result = await processUserDeposits(user);
      depositsDetected += result.incoming || 0;
      depositsCredited += result.creditedCount || 0;
      creditedUsd += result.totalCredited || 0;
    } catch (err) {
      console.warn(`Monitor scan user ${user._id}:`, err.message);
    }
  }

  return {
    usersScanned: users.length,
    depositsDetected,
    depositsCredited,
    creditedUsd: Math.round(creditedUsd * 100) / 100,
  };
}

/**
 * Full blockchain monitor cycle: listener scan, confirmation refresh, failed handling.
 */
export async function runBlockchainMonitor({ trigger = "cron" } = {}) {
  if (!BLOCKCHAIN_MONITOR_ENABLED) {
    return {
      ok: false,
      skipped: true,
      message: "Blockchain monitor is disabled (BLOCKCHAIN_MONITOR_ENABLED=false)",
    };
  }

  await connectDB();
  const started = Date.now();
  const run = await BlockchainMonitorRun.create({ status: "running", trigger });

  try {
    const scan = await scanAllUserDeposits();
    const refresh = await refreshPendingDeposits();
    const failed = await handleFailedTransactions();

    run.status = "completed";
    run.usersScanned = scan.usersScanned;
    run.depositsDetected = scan.depositsDetected;
    run.depositsCredited = scan.depositsCredited + refresh.credited;
    run.creditedUsd = scan.creditedUsd + refresh.creditedUsd;
    run.confirmationsUpdated = refresh.updated;
    run.failedMarked = failed.depositsFailed + failed.withdrawalsFailed;
    run.durationMs = Date.now() - started;
    await run.save();

    return {
      ok: true,
      run: run.toJSON(),
      scan,
      refresh,
      failed,
    };
  } catch (err) {
    run.status = "failed";
    run.error = err.message || "Monitor failed";
    run.durationMs = Date.now() - started;
    await run.save();
    throw err;
  }
}

export async function getMonitorStatus() {
  await connectDB();
  const [lastRun, recentRuns] = await Promise.all([
    BlockchainMonitorRun.findOne().sort({ createdAt: -1 }).lean(),
    BlockchainMonitorRun.find().sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  return {
    enabled: BLOCKCHAIN_MONITOR_ENABLED,
    lastRun: lastRun
      ? {
          id: lastRun._id.toString(),
          status: lastRun.status,
          trigger: lastRun.trigger,
          usersScanned: lastRun.usersScanned,
          depositsCredited: lastRun.depositsCredited,
          creditedUsd: lastRun.creditedUsd,
          confirmationsUpdated: lastRun.confirmationsUpdated,
          failedMarked: lastRun.failedMarked,
          durationMs: lastRun.durationMs,
          error: lastRun.error || "",
          createdAt: lastRun.createdAt,
        }
      : null,
    recentRuns: recentRuns.map((r) => ({
      id: r._id.toString(),
      status: r.status,
      trigger: r.trigger,
      depositsCredited: r.depositsCredited,
      creditedUsd: r.creditedUsd,
      durationMs: r.durationMs,
      createdAt: r.createdAt,
    })),
  };
}
