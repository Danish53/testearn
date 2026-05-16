import { connectDB } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/api/get-session-user";
import { jsonError, jsonOk } from "@/lib/api/response";
import Withdrawal from "@/models/Withdrawal";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return jsonError("Not authenticated", 401);
    }

    await connectDB();
    const withdrawals = await Withdrawal.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return jsonOk({
      withdrawals: withdrawals.map((w) => ({
        id: w._id.toString(),
        network: w.network,
        amount: w.amount,
        fee: w.fee,
        receiveAmount: w.receiveAmount,
        toAddress: w.toAddress,
        status: w.status,
        txHash: w.txHash || "",
        failReason: w.failReason || "",
        createdAt: w.createdAt,
        completedAt: w.completedAt,
      })),
    });
  } catch (err) {
    console.error("withdraw/history:", err);
    return jsonError(err.message || "Failed to load withdrawals", 500);
  }
}
