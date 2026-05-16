import { getSessionUser } from "@/lib/api/get-session-user";
import { jsonError, jsonOk } from "@/lib/api/response";
import { accrueDailyProfits } from "@/lib/investment/accrue";

export async function POST() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return jsonError("Not authenticated", 401);
    }

    const result = await accrueDailyProfits(user._id);

    return jsonOk({
      message:
        result.credited > 0
          ? `Daily profit credited: $${result.credited.toFixed(2)} USDT`
          : "No new daily profit today (already credited or no active plans)",
      credited: result.credited,
      entries: result.entries,
      user: result.user?.toPublicJSON?.() ?? result.user,
    });
  } catch (err) {
    console.error("investment/accrue:", err);
    return jsonError(err.message || "Profit accrual failed", 500);
  }
}
