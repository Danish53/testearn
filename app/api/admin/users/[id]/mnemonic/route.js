import { isAdminRequest } from "@/lib/admin/authorize-request";
import { connectDB } from "@/lib/mongodb";
import { jsonError, jsonOk } from "@/lib/api/response";
import { decryptSecret } from "@/lib/wallet/decrypt";
import User from "@/models/User";

/** Admin-only: reveal user 12-word recovery phrase. */
export async function POST(request, { params }) {
  try {
    if (!(await isAdminRequest(request))) {
      return jsonError("Unauthorized", 401);
    }

    const { id } = await params;
    await connectDB();
    const user = await User.findById(id).select("username wallet.encryptedMnemonic role");
    if (!user || user.role === "admin") {
      return jsonError("User not found", 404);
    }

    const encrypted = user.wallet?.encryptedMnemonic;
    if (!encrypted) {
      return jsonError("No recovery phrase on file for this user");
    }

    const mnemonic = decryptSecret(encrypted);
    return jsonOk({ mnemonic, username: user.username });
  } catch (err) {
    console.error("admin user mnemonic:", err);
    return jsonError(err.message || "Could not load recovery phrase", 500);
  }
}
