import { isAdminRequest } from "@/lib/admin/authorize-request";
import { getReferralSettings, updateReferralSettings } from "@/lib/referral/settings";
import { jsonError, jsonOk } from "@/lib/api/response";

export async function GET(request) {
  try {
    if (!(await isAdminRequest(request))) {
      return jsonError("Unauthorized", 401);
    }
    const doc = await getReferralSettings();
    return jsonOk({ settings: doc.toAdminJSON() });
  } catch (err) {
    console.error("admin referral-settings GET:", err);
    return jsonError(err.message || "Failed to load settings", 500);
  }
}

export async function PATCH(request) {
  try {
    if (!(await isAdminRequest(request))) {
      return jsonError("Unauthorized", 401);
    }
    const body = await request.json();
    const result = await updateReferralSettings(body);
    if (!result.ok) {
      return jsonError(result.message);
    }
    return jsonOk({
      message: "Referral settings saved",
      settings: result.settings.toAdminJSON(),
    });
  } catch (err) {
    console.error("admin referral-settings PATCH:", err);
    return jsonError(err.message || "Update failed", 500);
  }
}
