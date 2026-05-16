import { connectDB } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/api/get-session-user";
import { jsonError, jsonOk } from "@/lib/api/response";
import Commission from "@/models/Commission";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return jsonError("Not authenticated", 401);
    }

    await connectDB();
    const rows = await Commission.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("fromUserId", "username")
      .lean();

    return jsonOk({
      commissions: rows.map((c) => ({
        id: c._id.toString(),
        level: c.level,
        amount: c.amount,
        percent: c.percent,
        packageName: c.packageName,
        investmentAmount: c.investmentAmount,
        fromUsername: c.fromUserId?.username || "—",
        createdAt: c.createdAt,
      })),
      totalEarnings: user.referralEarnings ?? 0,
    });
  } catch (err) {
    console.error("referral/commissions:", err);
    return jsonError(err.message || "Failed to load commissions", 500);
  }
}
