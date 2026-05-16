import { performLogin } from "@/lib/auth/perform-login";
import { jsonError, jsonOk } from "@/lib/api/response";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    const result = await performLogin(email, password);
    if (!result.ok) {
      return jsonError(result.message, result.status);
    }

    if (result.role === "admin") {
      return jsonOk({ role: "admin", admin: result.admin });
    }

    return jsonOk({ role: "user", user: result.user });
  } catch (err) {
    console.error("login:", err);
    return jsonError(err.message || "Login failed", 500);
  }
}
