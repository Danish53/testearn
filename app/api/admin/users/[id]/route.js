import { isAdminRequest } from "@/lib/admin/authorize-request";
import { getAdminUserById, updateAdminUser } from "@/lib/admin/users";
import { jsonError, jsonOk } from "@/lib/api/response";

export async function GET(request, { params }) {
  try {
    if (!(await isAdminRequest(request))) {
      return jsonError("Unauthorized", 401);
    }

    const { id } = await params;
    const user = await getAdminUserById(id);
    if (!user) {
      return jsonError("User not found", 404);
    }

    return jsonOk({ user });
  } catch (err) {
    console.error("admin user GET:", err);
    return jsonError(err.message || "Failed to load user", 500);
  }
}

export async function PATCH(request, { params }) {
  try {
    if (!(await isAdminRequest(request))) {
      return jsonError("Unauthorized", 401);
    }

    const { id } = await params;
    const body = await request.json();

    const result = await updateAdminUser(id, body);
    if (!result.ok) {
      return jsonError(result.message);
    }

    return jsonOk({
      message: body.isBlocked !== undefined
        ? body.isBlocked
          ? "User blocked"
          : "User unblocked"
        : "User updated",
      user: result.user,
    });
  } catch (err) {
    console.error("admin user PATCH:", err);
    if (err.code === 11000) {
      return jsonError("Email or username already in use", 409);
    }
    return jsonError(err.message || "Update failed", 500);
  }
}
