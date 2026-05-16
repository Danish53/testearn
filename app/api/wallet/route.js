import { getSessionUser } from "@/lib/api/get-session-user";
import { jsonError, jsonOk } from "@/lib/api/response";
import { walletNetworksForUser } from "@/lib/wallet/networks";
import { userHasWallet } from "@/lib/wallet/provision";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return jsonError("Not authenticated", 401);
    }
    if (!userHasWallet(user)) {
      return jsonError("Wallet not provisioned", 404);
    }

    return jsonOk({
      wallet: {
        networks: walletNetworksForUser(user.wallet),
        createdAt: user.walletCreatedAt,
        secured: true,
      },
    });
  } catch (err) {
    console.error("wallet GET:", err);
    return jsonError(err.message || "Failed to load wallet", 500);
  }
}
