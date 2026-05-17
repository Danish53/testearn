import { isAdminRequest } from "@/lib/admin/authorize-request";
import { listAdminDeposits } from "@/lib/admin/deposits";
import { jsonError, jsonOk } from "@/lib/api/response";

export async function GET(request) {
  try {
    if (!(await isAdminRequest(request))) {
      return jsonError("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const result = await listAdminDeposits({
      q: searchParams.get("q") || "",
      status: searchParams.get("status") || "all",
      network: searchParams.get("network") || "all",
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 20,
    });

    return jsonOk(result);
  } catch (err) {
    console.error("admin deposits GET:", err);
    return jsonError(err.message || "Failed to load deposits", 500);
  }
}
