import { connectDB } from "@/lib/mongodb";
import {
  MIN_CONFIRMATIONS,
  MIN_DEPOSIT_USDT,
} from "@/lib/deposit/constants";
import { scanBep20Deposits } from "@/lib/deposit/scan-bep20";
import { scanTrc20Deposits } from "@/lib/deposit/scan-trc20";
import Deposit from "@/models/Deposit";
import User from "@/models/User";

async function upsertAndCredit(user, incoming) {
  let deposit = await Deposit.findOne({
    network: incoming.network,
    txHash: incoming.txHash,
  });

  const belowMin = incoming.amount < MIN_DEPOSIT_USDT;
  const confirmed =
    incoming.confirmations >= MIN_CONFIRMATIONS || incoming.network === "trc20";

  if (!deposit) {
    deposit = await Deposit.create({
      userId: user._id,
      network: incoming.network,
      txHash: incoming.txHash,
      fromAddress: incoming.fromAddress,
      toAddress: incoming.toAddress,
      amount: incoming.amount,
      confirmations: incoming.confirmations,
      blockTime: incoming.blockTime,
      status: belowMin ? "below_minimum" : confirmed ? "confirmed" : "pending",
    });
  } else if (
    deposit.status === "credited" ||
    deposit.status === "below_minimum" ||
    deposit.status === "failed"
  ) {
    return { deposit, credited: false };
  } else {
    deposit.confirmations = incoming.confirmations;
    deposit.lastCheckedAt = new Date();
    if (belowMin) deposit.status = "below_minimum";
    else if (confirmed) deposit.status = "confirmed";
    await deposit.save();
  }

  if (belowMin || deposit.status === "credited") {
    return { deposit, credited: false };
  }

  if (!confirmed) {
    return { deposit, credited: false };
  }

  user.balance = (user.balance || 0) + incoming.amount;
  user.totalDeposited = (user.totalDeposited || 0) + incoming.amount;
  await user.save();

  deposit.status = "credited";
  deposit.creditedAt = new Date();
  await deposit.save();

  return { deposit, credited: true, amount: incoming.amount };
}

/** Scan TRC20 + BEP20 for user wallet addresses and credit new deposits. */
export async function processUserDeposits(user) {
  await connectDB();

  const trc20 = user.wallet?.trc20Address || "";
  const bep20 = user.wallet?.bep20Address || "";

  const [trcIncoming, bepIncoming] = await Promise.all([
    scanTrc20Deposits(trc20),
    scanBep20Deposits(bep20),
  ]);

  const incoming = [...trcIncoming, ...bepIncoming];
  const results = [];
  let totalCredited = 0;
  let creditedCount = 0;

  if (!(await User.findById(user._id))) {
    return { incoming: 0, creditedCount: 0, totalCredited: 0, deposits: [] };
  }

  for (const item of incoming) {
    const freshUser = await User.findById(user._id);
    if (!freshUser) break;
    const { deposit, credited, amount } = await upsertAndCredit(freshUser, item);
    results.push(deposit);
    if (credited) {
      creditedCount += 1;
      totalCredited += amount;
    }
  }

  const updatedUser = await User.findById(user._id);

  return {
    incoming: incoming.length,
    creditedCount,
    totalCredited,
    balance: updatedUser?.balance ?? 0,
    deposits: results.slice(0, 10),
    scannedAt: new Date().toISOString(),
  };
}
