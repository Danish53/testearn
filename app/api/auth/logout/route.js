import { clearAuthCookie } from "@/lib/api/auth-cookie";
import { jsonOk } from "@/lib/api/response";

export async function POST() {
  await clearAuthCookie();
  return jsonOk({ message: "Logged out" });
}
