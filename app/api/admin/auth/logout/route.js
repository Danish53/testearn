import { clearAuthCookie } from "@/lib/api/auth-cookie";
import { clearAdminCookie } from "@/lib/api/admin-cookie";
import { jsonOk } from "@/lib/api/response";

export async function POST() {
  await clearAuthCookie();
  await clearAdminCookie();
  return jsonOk({ message: "Logged out" });
}
