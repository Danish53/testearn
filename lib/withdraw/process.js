import { connectDB } from "@/lib/mongodb";
import {
  MAX_DAILY_WITHDRAW_USDT,
  MIN_WITHDRAW_USDT,
  WITHDRAW_AUTO_APPROVE,
  WITHDRAW_AUTO_SEND,
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
  if (user.isBlocked) {
    return { ok: false, message: "Account is suspended" };
  }

  const daily = await dailyWithdrawTotal(userId);
  if (daily + gross > MAX_DAILY_WITHDRAW_USDT) {
    return {
      ok: false,
      message: `Daily limit $${MAX_DAILY_WITHDRAW_USDT} USDT exceeded`,
    };
  }

  const pending = user.pendingWithdrawal || 0;
  const available = (user.balance || 0) - pending;
  if (available < gross) {
    return { ok: false, message: "Insufficient balance" };
  }

  user.pendingWithdrawal = pending + gross;
  await user.save();

  const withdrawal = await Withdrawal.create({
    userId: user._id,
    network,
    amount: gross,
    fee,
    receiveAmount,
    toAddress: addrCheck.normalized,
    status: "pending",
    balanceDeductedAtRequest: false,
  });

  if (WITHDRAW_AUTO_APPROVE && WITHDRAW_AUTO_SEND) {
    await approveAndExecuteWithdrawal(withdrawal._id);
    const fresh = await Withdrawal.findById(withdrawal._id).lean();
    const updatedUser = await User.findById(userId);
    return { ok: true, withdrawal: fresh, user: updatedUser };
  }

  const updatedUser = await User.findById(userId);
  return { ok: true, withdrawal: withdrawal.toObject(), user: updatedUser };
}

/**
 * Admin manually sent USDT to user wallet — mark completed and deduct balance on approve.
 */
export async function approveManualWithdrawal(withdrawalId, txHash = "") {
  await connectDB();
  const withdrawal = await Withdrawal.findById(withdrawalId);
  if (!withdrawal) {
    throw new Error("Withdrawal not found");
  }
  if (withdrawal.status !== "pending") {
    throw new Error("Only pending withdrawals can be approved");
  }

  const user = await User.findById(withdrawal.userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (!withdrawal.balanceDeductedAtRequest) {
    const bal = user.balance || 0;
    const pending = user.pendingWithdrawal || 0;
    if (bal >= withdrawal.amount) {
      user.balance = bal - withdrawal.amount;
    } else if (pending < withdrawal.amount) {
      throw new Error("User balance is insufficient to complete this withdrawal");
    }
    // Legacy requests already had balance deducted at submit — only release pending.
  }

  user.pendingWithdrawal = Math.max(
    0,
    (user.pendingWithdrawal || 0) - withdrawal.amount
  );
  user.totalWithdrawn = (user.totalWithdrawn || 0) + withdrawal.amount;
  await user.save();

  withdrawal.status = "completed";
  withdrawal.txHash = String(txHash || "").trim();
  withdrawal.approvedAt = new Date();
  withdrawal.completedAt = new Date();
  withdrawal.approvedByAdmin = true;
  await withdrawal.save();

  return withdrawal;
}

export async function approveAndExecuteWithdrawal(withdrawalId) {
  if (!WITHDRAW_AUTO_SEND) {
    return approveManualWithdrawal(withdrawalId, "");
  }

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

    if (!withdrawal.balanceDeductedAtRequest) {
      user.balance = Math.max(0, (user.balance || 0) - withdrawal.amount);
    }
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

    if (withdrawal.balanceDeductedAtRequest) {
      user.balance = (user.balance || 0) + withdrawal.amount;
    }
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

  if (withdrawal.balanceDeductedAtRequest) {
    user.balance = (user.balance || 0) + withdrawal.amount;
  }
  user.pendingWithdrawal = Math.max(
    0,
    (user.pendingWithdrawal || 0) - withdrawal.amount
  );
  await user.save();

  return withdrawal;
}
