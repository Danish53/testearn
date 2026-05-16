import { getSessionAdmin, adminToPublicJSON } from "@/lib/api/get-session-admin";
import { jsonError, jsonOk } from "@/lib/api/response";

export async function GET() {
  try {
    const admin = await getSessionAdmin();
    if (!admin) {
      return jsonError("Not authenticated", 401);
    }
    return jsonOk({ admin: adminToPublicJSON(admin) });
  } catch (err) {
    console.error("admin me:", err);
    return jsonError(err.message || "Session error", 500);
  }
}
