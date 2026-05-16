import { getSessionUser } from "@/lib/api/get-session-user";
import { jsonError, jsonOk } from "@/lib/api/response";
import { buildDashboardStats } from "@/lib/dashboard/get-user-stats";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return jsonError("Not authenticated", 401);
    }

    const stats = await buildDashboardStats(user);
    return jsonOk({ stats });
  } catch (err) {
    console.error("dashboard/stats:", err);
    return jsonError(err.message || "Failed to load dashboard stats", 500);
  }
}
