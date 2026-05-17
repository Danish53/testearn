import { jsonError } from "@/lib/api/response";

/** Recovery phrase is admin-only — users cannot reveal it from the dashboard. */
export async function POST() {
  return jsonError(
    "Recovery phrase is managed by your administrator. Contact support if you need help.",
    403
  );
}
