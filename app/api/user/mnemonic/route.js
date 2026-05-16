import { comparePassword } from "@/lib/auth/password";
import { getSessionUser } from "@/lib/api/get-session-user";
import { jsonError, jsonOk } from "@/lib/api/response";
import { decryptSecret } from "@/lib/wallet/decrypt";

export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return jsonError("Not authenticated", 401);
    }

    const body = await request.json();
    const password = String(body.password || "");
    if (!password) {
      return jsonError("Password is required to reveal recovery phrase");
    }

    const match = await comparePassword(password, user.passwordHash);
    if (!match) {
      return jsonError("Incorrect password", 401);
    }

    const encrypted = user.wallet?.encryptedMnemonic;
    if (!encrypted) {
      return jsonError("No recovery phrase on file for this account");
    }

    const mnemonic = decryptSecret(encrypted);
    return jsonOk({ mnemonic });
  } catch (err) {
    console.error("mnemonic:", err);
    return jsonError(err.message || "Could not load recovery phrase", 500);
  }
}
