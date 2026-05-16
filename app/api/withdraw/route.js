import { getSessionUser } from "@/lib/api/get-session-user";
import { jsonError, jsonOk } from "@/lib/api/response";
import { createWithdrawalRequest } from "@/lib/withdraw/process";

export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return jsonError("Not authenticated", 401);
    }

    const body = await request.json();
    const amount = body.amount;
    const toAddress = body.toAddress || body.address;
    const network = String(body.network || "trc20").toLowerCase();

    if (network !== "trc20" && network !== "bep20") {
      return jsonError("Network must be trc20 or bep20");
    }

    const result = await createWithdrawalRequest(user._id, {
      amount,
      toAddress,
      network,
    });

    if (!result.ok) {
      return jsonError(result.message);
    }

    const w = result.withdrawal;
    return jsonOk({
      message:
        w.status === "completed"
          ? "Withdrawal completed — USDT sent to your address"
          : "Withdrawal request submitted — pending admin approval",
      withdrawal: {
        id: w._id?.toString() || w.id,
        network: w.network,
        amount: w.amount,
        fee: w.fee,
        receiveAmount: w.receiveAmount,
        toAddress: w.toAddress,
        status: w.status,
        txHash: w.txHash || "",
        createdAt: w.createdAt,
      },
      user: result.user?.toPublicJSON?.() ?? result.user,
    });
  } catch (err) {
    console.error("withdraw POST:", err);
    return jsonError(err.message || "Withdrawal failed", 500);
  }
}
