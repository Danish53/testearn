import { performLogin } from "@/lib/auth/perform-login";
import { jsonError, jsonOk } from "@/lib/api/response";

/** Same credentials as /api/auth/login — kept for API compatibility. */
export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    const result = await performLogin(email, password);
    if (!result.ok) {
      return jsonError(result.message, result.status);
    }
    if (result.role !== "admin") {
      return jsonError("This account is not an administrator", 403);
    }

    return jsonOk({ role: "admin", admin: result.admin });
  } catch (err) {
    console.error("admin login:", err);
    return jsonError(err.message || "Login failed", 500);
  }
}
