import { isAuthorizedCronRequest } from "@/lib/blockchain/auth-cron";
import { runBlockchainMonitor } from "@/lib/blockchain/monitor";
import { jsonError, jsonOk } from "@/lib/api/response";

/**
 * POST /api/cron/blockchain-monitor
 * Schedule via cron (e.g. every 2–5 min). Requires CRON_SECRET or ADMIN_SECRET header.
 *
 * curl -X POST https://yoursite.com/api/cron/blockchain-monitor \
 *   -H "Authorization: Bearer YOUR_CRON_SECRET"
 */
export async function POST(request) {
  if (!isAuthorizedCronRequest(request)) {
    return jsonError("Unauthorized", 401);
  }

  try {
    const result = await runBlockchainMonitor({ trigger: "cron" });
    if (result.skipped) {
      return jsonOk({ message: result.message, skipped: true });
    }
    return jsonOk({
      message: "Blockchain monitor completed",
      run: result.run,
      scan: result.scan,
      refresh: result.refresh,
      failed: result.failed,
    });
  } catch (err) {
    console.error("cron/blockchain-monitor:", err);
    return jsonError(err.message || "Monitor failed", 500);
  }
}

export async function GET(request) {
  return POST(request);
}
