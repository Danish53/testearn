import { getSessionUser } from "@/lib/api/get-session-user";
import { jsonError, jsonOk } from "@/lib/api/response";
import {
  listWalletAlertsForUser,
  markWalletAlertsRead,
} from "@/lib/deposit/wallet-alerts";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return jsonError("Not authenticated", 401);

    const alerts = await listWalletAlertsForUser(user._id);
    return jsonOk({ alerts });
  } catch (err) {
    console.error("deposit/alerts GET:", err);
    return jsonError(err.message || "Failed to load alerts", 500);
  }
}

export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user) return jsonError("Not authenticated", 401);

    const body = await request.json().catch(() => ({}));
    const alertIds = Array.isArray(body.alertIds) ? body.alertIds : [];
    await markWalletAlertsRead(user._id, alertIds);
    return jsonOk({ message: "Notifications cleared" });
  } catch (err) {
    console.error("deposit/alerts POST:", err);
    return jsonError(err.message || "Failed to update alerts", 500);
  }
}
