import { connectDB } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/api/get-session-user";
import { jsonError, jsonOk } from "@/lib/api/response";
import Investment from "@/models/Investment";
import ProfitLog from "@/models/ProfitLog";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return jsonError("Not authenticated", 401);
    }

    await connectDB();
    const [investments, profits] = await Promise.all([
      Investment.find({ userId: user._id }).sort({ createdAt: -1 }).limit(50).lean(),
      ProfitLog.find({ userId: user._id }).sort({ createdAt: -1 }).limit(50).lean(),
    ]);

    return jsonOk({
      purchases: investments.map((i) => ({
        id: i._id.toString(),
        packageId: i.packageId,
        packageName: i.packageName,
        amount: i.investment,
        dailyProfit: i.dailyProfit,
        status: i.status,
        createdAt: i.createdAt,
        activatedAt: i.activatedAt,
      })),
      profits: profits.map((p) => ({
        id: p._id.toString(),
        packageName: p.packageName,
        amount: p.amount,
        profitDate: p.profitDate,
        createdAt: p.createdAt,
      })),
    });
  } catch (err) {
    console.error("investment/history:", err);
    return jsonError(err.message || "Failed to load history", 500);
  }
}
