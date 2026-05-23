import { connectDB } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/api/get-session-user";
import { jsonError, jsonOk } from "@/lib/api/response";
import { processUserDeposits } from "@/lib/deposit/process";
import { userHasWallet } from "@/lib/wallet/provision";
import User from "@/models/User";

export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return jsonError("Not authenticated", 401);
    }
    if (!userHasWallet(user)) {
      return jsonError("Wallet not found", 404);
    }

    const body = await request.json().catch(() => ({}));
    const txHash = String(body.txHash || "").trim();
    const network = String(body.network || "bep20").toLowerCase();

    const result = await processUserDeposits(user, { txHash, network });
    await connectDB();
    const updated = await User.findById(user._id);

    let message =
      result.creditedCount > 0
        ? `Credited ${result.creditedCount} deposit(s) — $${result.totalCredited.toFixed(2)} USDT`
        : "Scan complete — no new deposits yet";

    const waiting = (result.deposits || []).filter((d) =>
      ["pending", "confirmed", "below_minimum"].includes(d.status)
    );
    if (result.creditedCount === 0 && waiting.length > 0) {
      message =
        "Deposit detected — pending confirmations or below $3 minimum (see Recent deposits)";
    } else if (result.txHint) {
      message = result.txHint;
    } else if (
      result.creditedCount === 0 &&
      result.incoming === 0 &&
      result.bep20UsdtOnChain === 0
    ) {
      message =
        "No USDT on your BEP20 address on BSC yet. Send USDT (not BNB coin) on BNB Smart Chain, or paste your transaction hash below.";
    }

    return jsonOk({
      message,
      ...result,
      alerts: result.alerts || [],
      depositAddress: user.wallet?.bep20Address || "",
      user: updated ? updated.toPublicJSON() : user.toPublicJSON(),
    });
  } catch (err) {
    console.error("deposit/check:", err);
    return jsonError(err.message || "Deposit scan failed", 500);
  }
}
