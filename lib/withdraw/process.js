import { connectDB } from "@/lib/mongodb";
import {
  MAX_DAILY_WITHDRAW_USDT,
  MIN_WITHDRAW_USDT,
  WITHDRAW_AUTO_APPROVE,
  WITHDRAW_FEE_USDT,
} from "@/lib/withdraw/constants";
import { executeWithdrawalTransfer } from "@/lib/withdraw/execute";
import { validateWithdrawAddress } from "@/lib/withdraw/validate-address";
import User from "@/models/User";
import Withdrawal from "@/models/Withdrawal";

async function dailyWithdrawTotal(userId) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const rows = await Withdrawal.find({
    userId,
    createdAt: { $gte: start },
    status: { $nin: ["rejected", "failed"] },
  }).lean();
  return rows.reduce((s, w) => s + w.amount, 0);
}

export async function createWithdrawalRequest(userId, { amount, toAddress, network }) {
  await connectDB();

  const gross = Number(amount);
  if (!Number.isFinite(gross) || gross <= 0) {
    return { ok: false, message: "Enter a valid amount" };
  }
  if (gross < MIN_WITHDRAW_USDT) {
    return { ok: false, message: `Minimum withdrawal is $${MIN_WITHDRAW_USDT} USDT` };
  }

  const addrCheck = validateWithdrawAddress(network, toAddress);
  if (!addrCheck.ok) {
    return { ok: false, message: addrCheck.message };
  }

  const fee = WITHDRAW_FEE_USDT;
  const receiveAmount = Math.round((gross - fee) * 100) / 100;
  if (receiveAmount <= 0) {
    return { ok: false, message: "Amount too small after network fee" };
  }

  const user = await User.findById(userId);
  if (!user?.isVerified) {
    return { ok: false, message: "Account not verified" };
  }

  const daily = await dailyWithdrawTotal(userId);
  if (daily + gross > MAX_DAILY_WITHDRAW_USDT) {
    return {
      ok: false,
      message: `Daily limit $${MAX_DAILY_WITHDRAW_USDT} USDT exceeded`,
    };
  }

  if ((user.balance || 0) < gross) {
    return { ok: false, message: "Insufficient balance" };
  }

  user.balance = (user.balance || 0) - gross;
  user.pendingWithdrawal = (user.pendingWithdrawal || 0) + gross;
  await user.save();

  const withdrawal = await Withdrawal.create({
    userId: user._id,
    network,
    amount: gross,
    fee,
    receiveAmount,
    toAddress: addrCheck.normalized,
    status: "pending",
  });

  if (WITHDRAW_AUTO_APPROVE) {
    await approveAndExecuteWithdrawal(withdrawal._id);
    const fresh = await Withdrawal.findById(withdrawal._id).lean();
    const updatedUser = await User.findById(userId);
    return { ok: true, withdrawal: fresh, user: updatedUser };
  }

  const updatedUser = await User.findById(userId);
  return { ok: true, withdrawal: withdrawal.toObject(), user: updatedUser };
}

export async function approveAndExecuteWithdrawal(withdrawalId) {
  await connectDB();
  const withdrawal = await Withdrawal.findById(withdrawalId);
  if (!withdrawal) {
    throw new Error("Withdrawal not found");
  }
  if (["completed", "rejected", "failed"].includes(withdrawal.status)) {
    return withdrawal;
  }

  const user = await User.findById(withdrawal.userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (withdrawal.status === "pending") {
    withdrawal.status = "approved";
    withdrawal.approvedAt = new Date();
    await withdrawal.save();
  }

  withdrawal.status = "processing";
  await withdrawal.save();

  try {
    const { txHash } = await executeWithdrawalTransfer(user, withdrawal);
    withdrawal.status = "completed";
    withdrawal.txHash = txHash;
    withdrawal.completedAt = new Date();
    await withdrawal.save();

    user.pendingWithdrawal = Math.max(
      0,
      (user.pendingWithdrawal || 0) - withdrawal.amount
    );
    user.totalWithdrawn = (user.totalWithdrawn || 0) + withdrawal.amount;
    await user.save();
  } catch (err) {
    withdrawal.status = "failed";
    withdrawal.failReason = err.message || "Transfer failed";
    await withdrawal.save();

    user.balance = (user.balance || 0) + withdrawal.amount;
    user.pendingWithdrawal = Math.max(
      0,
      (user.pendingWithdrawal || 0) - withdrawal.amount
    );
    await user.save();
    throw err;
  }

  return withdrawal;
}

export async function rejectWithdrawal(withdrawalId, reason = "") {
  await connectDB();
  const withdrawal = await Withdrawal.findById(withdrawalId);
  if (!withdrawal || withdrawal.status !== "pending") {
    throw new Error("Cannot reject this withdrawal");
  }

  const user = await User.findById(withdrawal.userId);
  if (!user) throw new Error("User not found");

  withdrawal.status = "rejected";
  withdrawal.failReason = reason;
  await withdrawal.save();

  user.balance = (user.balance || 0) + withdrawal.amount;
  user.pendingWithdrawal = Math.max(
    0,
    (user.pendingWithdrawal || 0) - withdrawal.amount
  );
  await user.save();

  return withdrawal;
}
