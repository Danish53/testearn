import { getSessionUser } from "@/lib/api/get-session-user";
import { jsonError, jsonOk } from "@/lib/api/response";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return jsonError("Not authenticated", 401);
    }
    return jsonOk({ user: user.toPublicJSON() });
  } catch (err) {
    console.error("me:", err);
    return jsonError(err.message || "Session error", 500);
  }
}
