import { getSessionUser } from "@/lib/api/get-session-user";
import { jsonError, jsonOk } from "@/lib/api/response";
import { buildRegisterReferralUrl } from "@/lib/auth/referral";
import { getReferralTeam } from "@/lib/referral/team";

export async function GET(request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return jsonError("Not authenticated", 401);
    }

    const team = await getReferralTeam(user._id);
    const origin = new URL(request.url).origin;

    return jsonOk({
      team,
      referralLink: buildRegisterReferralUrl(origin, team.referralCode),
    });
  } catch (err) {
    console.error("referral/team:", err);
    return jsonError(err.message || "Failed to load team", 500);
  }
}
