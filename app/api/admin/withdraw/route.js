import { connectDB } from "@/lib/mongodb";
import { isAdminRequest } from "@/lib/admin/authorize-request";
import { jsonError, jsonOk } from "@/lib/api/response";
import {
  approveAndExecuteWithdrawal,
  rejectWithdrawal,
} from "@/lib/withdraw/process";
import Withdrawal from "@/models/Withdrawal";

/** GET pending withdrawals (admin). */
export async function GET(request) {
  try {
    if (!(await isAdminRequest(request))) {
      return jsonError("Unauthorized", 401);
    }
    await connectDB();
    const pending = await Withdrawal.find({ status: "pending" })
      .sort({ createdAt: 1 })
      .populate("userId", "username email")
      .lean();

    return jsonOk({
      withdrawals: pending.map((w) => ({
        id: w._id.toString(),
        username: w.userId?.username,
        email: w.userId?.email,
        network: w.network,
        amount: w.amount,
        receiveAmount: w.receiveAmount,
        toAddress: w.toAddress,
        createdAt: w.createdAt,
      })),
    });
  } catch (err) {
    console.error("admin/withdraw GET:", err);
    return jsonError(err.message || "Failed", 500);
  }
}

/** POST approve or reject: { withdrawalId, action: "approve" | "reject", reason? } */
export async function POST(request) {
  try {
    if (!(await isAdminRequest(request))) {
      return jsonError("Unauthorized", 401);
    }

    const body = await request.json();
    const withdrawalId = body.withdrawalId;
    const action = body.action;

    if (!withdrawalId) {
      return jsonError("withdrawalId required");
    }

    if (action === "approve") {
      const w = await approveAndExecuteWithdrawal(withdrawalId);
      return jsonOk({
        message: "Withdrawal processed",
        withdrawal: {
          id: w._id.toString(),
          status: w.status,
          txHash: w.txHash,
        },
      });
    }

    if (action === "reject") {
      const w = await rejectWithdrawal(withdrawalId, body.reason || "");
      return jsonOk({
        message: "Withdrawal rejected — balance refunded",
        withdrawal: { id: w._id.toString(), status: w.status },
      });
    }

    return jsonError("action must be approve or reject");
  } catch (err) {
    console.error("admin/withdraw POST:", err);
    return jsonError(err.message || "Admin action failed", 500);
  }
}
