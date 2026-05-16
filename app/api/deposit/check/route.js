import { connectDB } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/api/get-session-user";
import { jsonError, jsonOk } from "@/lib/api/response";
import { processUserDeposits } from "@/lib/deposit/process";
import { userHasWallet } from "@/lib/wallet/provision";
import User from "@/models/User";

export async function POST() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return jsonError("Not authenticated", 401);
    }
    if (!userHasWallet(user)) {
      return jsonError("Wallet not found", 404);
    }

    const result = await processUserDeposits(user);
    await connectDB();
    const updated = await User.findById(user._id);

    return jsonOk({
      message:
        result.creditedCount > 0
          ? `Credited ${result.creditedCount} deposit(s) — $${result.totalCredited.toFixed(2)} USDT`
          : "Scan complete — no new deposits yet",
      ...result,
      user: updated ? updated.toPublicJSON() : user.toPublicJSON(),
    });
  } catch (err) {
    console.error("deposit/check:", err);
    return jsonError(err.message || "Deposit scan failed", 500);
  }
}
