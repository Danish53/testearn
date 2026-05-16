import { connectDB } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/api/get-session-user";
import { jsonError, jsonOk } from "@/lib/api/response";
import Deposit from "@/models/Deposit";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return jsonError("Not authenticated", 401);
    }

    await connectDB();
    const deposits = await Deposit.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return jsonOk({
      deposits: deposits.map((d) => ({
        id: d._id.toString(),
        network: d.network,
        txHash: d.txHash,
        amount: d.amount,
        status: d.status,
        confirmations: d.confirmations,
        blockTime: d.blockTime,
        creditedAt: d.creditedAt,
        createdAt: d.createdAt,
      })),
    });
  } catch (err) {
    console.error("deposit/history:", err);
    return jsonError(err.message || "Failed to load history", 500);
  }
}
