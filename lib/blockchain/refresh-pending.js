import { connectDB } from "@/lib/mongodb";
import {
  MIN_CONFIRMATIONS,
  MIN_DEPOSIT_USDT,
} from "@/lib/deposit/constants";
import { getBep20Confirmations, isDepositConfirmed } from "@/lib/deposit/confirmations";
import Deposit from "@/models/Deposit";
import User from "@/models/User";

/** Update pending BEP20 deposits and credit when confirmations are sufficient. */
export async function refreshPendingDeposits() {
  await connectDB();

  const pending = await Deposit.find({
    status: { $in: ["pending", "confirmed"] },
    network: "bep20",
  }).limit(200);

  let updated = 0;
  let credited = 0;
  let creditedUsd = 0;

  for (const deposit of pending) {
    const confirmations = await getBep20Confirmations(deposit.txHash);
    deposit.confirmations = confirmations;
    deposit.lastCheckedAt = new Date();

    const belowMin = deposit.amount < MIN_DEPOSIT_USDT;
    const confirmed = isDepositConfirmed(deposit.network, confirmations);

    if (belowMin) {
      deposit.status = "below_minimum";
      await deposit.save();
      updated += 1;
      continue;
    }

    if (!confirmed) {
      deposit.status = "pending";
      await deposit.save();
      updated += 1;
      continue;
    }

    deposit.status = "confirmed";
    await deposit.save();
    updated += 1;

    const user = await User.findById(deposit.userId);
    if (!user) continue;

    user.balance = (user.balance || 0) + deposit.amount;
    user.totalDeposited = (user.totalDeposited || 0) + deposit.amount;
    await user.save();

    deposit.status = "credited";
    deposit.creditedAt = new Date();
    await deposit.save();

    credited += 1;
    creditedUsd += deposit.amount;
  }

  return { updated, credited, creditedUsd };
}
