import { getSessionUser } from "@/lib/api/get-session-user";
import { jsonError, jsonOk } from "@/lib/api/response";
import { purchasePackage } from "@/lib/investment/purchase";

export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return jsonError("Not authenticated", 401);
    }

    const body = await request.json();
    const packageId = String(body.packageId || "").trim();
    if (!packageId) {
      return jsonError("packageId is required");
    }

    const result = await purchasePackage(user._id, packageId);
    if (!result.ok) {
      return jsonError(result.message);
    }

    return jsonOk({
      message: `${result.package.name} activated — ${result.package.dailyProfit} USDT daily profit`,
      investment: {
        id: result.investment._id.toString(),
        packageId: result.investment.packageId,
        packageName: result.investment.packageName,
        investment: result.investment.investment,
        dailyProfit: result.investment.dailyProfit,
        status: result.investment.status,
        activatedAt: result.investment.activatedAt,
      },
      user: result.user.toPublicJSON(),
    });
  } catch (err) {
    console.error("investment/purchase:", err);
    return jsonError(err.message || "Purchase failed", 500);
  }
}
