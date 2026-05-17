import { isAdminRequest } from "@/lib/admin/authorize-request";
import { listAdminWithdrawals } from "@/lib/admin/withdrawals";
import { jsonError, jsonOk } from "@/lib/api/response";
import {
  approveManualWithdrawal,
  approveAndExecuteWithdrawal,
  rejectWithdrawal,
} from "@/lib/withdraw/process";
import { WITHDRAW_AUTO_SEND } from "@/lib/withdraw/constants";

/** GET withdrawals — ?status=pending|completed|all */
export async function GET(request) {
  try {
    if (!(await isAdminRequest(request))) {
      return jsonError("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const result = await listAdminWithdrawals({
      status: searchParams.get("status") || "pending",
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 20,
    });

    return jsonOk(result);
  } catch (err) {
    console.error("admin/withdraw GET:", err);
    return jsonError(err.message || "Failed", 500);
  }
}

/**
 * POST approve or reject
 * approve: { withdrawalId, action: "approve", txHash? } — manual payout + balance deduct
 * reject: { withdrawalId, action: "reject", reason? }
 */
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
      const txHash = String(body.txHash || "").trim();
      const w = WITHDRAW_AUTO_SEND
        ? await approveAndExecuteWithdrawal(withdrawalId)
        : await approveManualWithdrawal(withdrawalId, txHash);

      return jsonOk({
        message: WITHDRAW_AUTO_SEND
          ? "Withdrawal sent on-chain"
          : "Withdrawal approved — user balance updated",
        withdrawal: {
          id: w._id.toString(),
          status: w.status,
          txHash: w.txHash,
          receiveAmount: w.receiveAmount,
          network: w.network,
        },
      });
    }

    if (action === "reject") {
      const w = await rejectWithdrawal(withdrawalId, body.reason || "");
      return jsonOk({
        message: "Withdrawal rejected — reserved balance released",
        withdrawal: { id: w._id.toString(), status: w.status },
      });
    }

    return jsonError("action must be approve or reject");
  } catch (err) {
    console.error("admin/withdraw POST:", err);
    return jsonError(err.message || "Admin action failed", 500);
  }
}
