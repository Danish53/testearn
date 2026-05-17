import { isAuthorizedCronRequest } from "@/lib/blockchain/auth-cron";
import { accrueAllUsersProfits } from "@/lib/investment/accrue";
import { jsonError, jsonOk } from "@/lib/api/response";

/** POST /api/cron/accrue-profits — credit 24h package profits (no blockchain API). */
export async function POST(request) {
  if (!isAuthorizedCronRequest(request)) {
    return jsonError("Unauthorized", 401);
  }

  try {
    const result = await accrueAllUsersProfits();
    return jsonOk({
      message: "Profit accrual completed",
      ...result,
    });
  } catch (err) {
    console.error("cron/accrue-profits:", err);
    return jsonError(err.message || "Accrual failed", 500);
  }
}

export async function GET(request) {
  return POST(request);
}
