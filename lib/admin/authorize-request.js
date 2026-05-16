import { getSessionAdmin } from "@/lib/api/get-session-admin";

/** Session admin (cookie) or legacy x-admin-secret header. */
export async function isAdminRequest(request) {
  const admin = await getSessionAdmin();
  if (admin) return true;

  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  return request.headers.get("x-admin-secret") === secret;
}
