import { comparePassword, hashPassword } from "@/lib/auth/password";
import { getSessionUser } from "@/lib/api/get-session-user";
import { jsonError, jsonOk } from "@/lib/api/response";

export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return jsonError("Not authenticated", 401);
    }

    const body = await request.json();
    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");

    if (!currentPassword || !newPassword) {
      return jsonError("Current and new password are required");
    }
    if (newPassword.length < 6) {
      return jsonError("New password must be at least 6 characters");
    }
    if (currentPassword === newPassword) {
      return jsonError("New password must be different from current password");
    }

    const match = await comparePassword(currentPassword, user.passwordHash);
    if (!match) {
      return jsonError("Current password is incorrect", 401);
    }

    user.passwordHash = await hashPassword(newPassword);
    await user.save();

    return jsonOk({ message: "Password updated successfully" });
  } catch (err) {
    console.error("change-password:", err);
    return jsonError(err.message || "Password change failed", 500);
  }
}
