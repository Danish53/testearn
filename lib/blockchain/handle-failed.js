import { connectDB } from "@/lib/mongodb";
import { getBep20Confirmations } from "@/lib/deposit/confirmations";
import { STALE_PENDING_HOURS, STUCK_WITHDRAWAL_HOURS } from "@/lib/blockchain/constants";
import Deposit from "@/models/Deposit";
import User from "@/models/User";
import Withdrawal from "@/models/Withdrawal";

/**
 * Mark stale pending deposits as failed (no on-chain receipt after window).
 * Release stuck processing withdrawals from auto-send attempts.
 */
export async function handleFailedTransactions() {
  await connectDB();

  const staleBefore = new Date(Date.now() - STALE_PENDING_HOURS * 60 * 60 * 1000);
  const stuckBefore = new Date(Date.now() - STUCK_WITHDRAWAL_HOURS * 60 * 60 * 1000);

  let depositsFailed = 0;
  let withdrawalsFailed = 0;

  const staleDeposits = await Deposit.find({
    status: { $in: ["pending", "confirmed"] },
    createdAt: { $lt: staleBefore },
  }).limit(100);

  for (const deposit of staleDeposits) {
    let confirmations = deposit.confirmations || 0;
    if (deposit.network === "bep20") {
      confirmations = await getBep20Confirmations(deposit.txHash);
      deposit.confirmations = confirmations;
    }

    if (confirmations > 0) {
      deposit.lastCheckedAt = new Date();
      await deposit.save();
      continue;
    }

    deposit.status = "failed";
    deposit.failReason =
      deposit.failReason ||
      `No on-chain confirmation after ${STALE_PENDING_HOURS}h — transaction may have been dropped`;
    deposit.lastCheckedAt = new Date();
    await deposit.save();
    depositsFailed += 1;
  }

  const stuck = await Withdrawal.find({
    status: "processing",
    updatedAt: { $lt: stuckBefore },
  }).limit(50);

  for (const withdrawal of stuck) {
    const user = await User.findById(withdrawal.userId);
    if (user) {
      if (withdrawal.balanceDeductedAtRequest) {
        user.balance = (user.balance || 0) + withdrawal.amount;
      }
      user.pendingWithdrawal = Math.max(
        0,
        (user.pendingWithdrawal || 0) - withdrawal.amount
      );
      await user.save();
    }

    withdrawal.status = "failed";
    withdrawal.failReason =
      withdrawal.failReason || "On-chain transfer did not complete within expected time";
    await withdrawal.save();
    withdrawalsFailed += 1;
  }

  return { depositsFailed, withdrawalsFailed };
}
