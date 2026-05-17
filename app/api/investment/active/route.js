import { connectDB } from "@/lib/mongodb";
import { formatInvestmentClient } from "@/lib/investment/profit-schedule";
import { getSessionUser } from "@/lib/api/get-session-user";
import { jsonError, jsonOk } from "@/lib/api/response";
import Investment from "@/models/Investment";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return jsonError("Not authenticated", 401);
    }

    await connectDB();
    const list = await Investment.find({ userId: user._id, status: "active" })
      .sort({ level: -1 })
      .lean();

    return jsonOk({
      investments: list.map((i) => formatInvestmentClient(i)),
    });
  } catch (err) {
    console.error("investment/active:", err);
    return jsonError(err.message || "Failed to load investments", 500);
  }
}
