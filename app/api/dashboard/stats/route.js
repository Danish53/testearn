import { getSessionUser } from "@/lib/api/get-session-user";
import { jsonError, jsonOk } from "@/lib/api/response";
import { buildDashboardStats } from "@/lib/dashboard/get-user-stats";
import { accrueDailyProfits } from "@/lib/investment/accrue";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return jsonError("Not authenticated", 401);
    }

    await accrueDailyProfits(user._id);
    const fresh = await getSessionUser();
    const stats = await buildDashboardStats(fresh || user);
    return jsonOk({
      stats,
      user: fresh?.toPublicJSON?.() ?? null,
    });
  } catch (err) {
    console.error("dashboard/stats:", err);
    return jsonError(err.message || "Failed to load dashboard stats", 500);
  }
}
