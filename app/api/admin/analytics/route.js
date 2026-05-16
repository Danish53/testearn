import { isAdminRequest } from "@/lib/admin/authorize-request";
import { getAdminAnalytics } from "@/lib/admin/analytics";
import { jsonError, jsonOk } from "@/lib/api/response";

export async function GET(request) {
  try {
    if (!(await isAdminRequest(request))) {
      return jsonError("Unauthorized", 401);
    }

    const analytics = await getAdminAnalytics();
    return jsonOk({ analytics });
  } catch (err) {
    console.error("admin analytics:", err);
    return jsonError(err.message || "Failed to load analytics", 500);
  }
}
