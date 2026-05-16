import { getSessionUser } from "@/lib/api/get-session-user";
import { jsonError, jsonOk } from "@/lib/api/response";
import { updateUserProfile } from "@/lib/user/update-profile";

export async function PATCH(request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return jsonError("Not authenticated", 401);
    }

    const body = await request.json();
    const result = await updateUserProfile(user._id, {
      username: body.username,
      email: body.email,
    });

    if (!result.ok) {
      return jsonError(result.message);
    }

    return jsonOk({
      message: "Profile updated",
      user: result.user.toPublicJSON(),
    });
  } catch (err) {
    console.error("profile PATCH:", err);
    if (err.code === 11000) {
      return jsonError("Email or username already in use", 409);
    }
    return jsonError(err.message || "Profile update failed", 500);
  }
}
