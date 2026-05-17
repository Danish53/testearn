import { isAdminRequest } from "@/lib/admin/authorize-request";
import { listBlockchainHistory } from "@/lib/admin/blockchain-history";
import { getMonitorStatus, runBlockchainMonitor } from "@/lib/blockchain/monitor";
import { jsonError, jsonOk } from "@/lib/api/response";

/** GET unified deposit + withdrawal history and monitor status */
export async function GET(request) {
  try {
    if (!(await isAdminRequest(request))) {
      return jsonError("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const [history, monitor] = await Promise.all([
      listBlockchainHistory({
        type: searchParams.get("type") || "all",
        status: searchParams.get("status") || "all",
        network: searchParams.get("network") || "all",
        q: searchParams.get("q") || "",
        page: searchParams.get("page") || 1,
        limit: searchParams.get("limit") || 25,
      }),
      getMonitorStatus(),
    ]);

    return jsonOk({ ...history, monitor });
  } catch (err) {
    console.error("admin/blockchain GET:", err);
    return jsonError(err.message || "Failed to load blockchain data", 500);
  }
}

/** POST — trigger manual blockchain scan */
export async function POST(request) {
  try {
    if (!(await isAdminRequest(request))) {
      return jsonError("Unauthorized", 401);
    }

    const result = await runBlockchainMonitor({ trigger: "admin" });
    if (result.skipped) {
      return jsonError(result.message);
    }

    const monitor = await getMonitorStatus();
    return jsonOk({
      message: `Monitor complete — ${result.run.depositsCredited} deposit(s) credited`,
      run: result.run,
      monitor,
    });
  } catch (err) {
    console.error("admin/blockchain POST:", err);
    return jsonError(err.message || "Monitor failed", 500);
  }
}
