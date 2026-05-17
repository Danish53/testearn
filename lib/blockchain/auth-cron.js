/** Verify cron / internal monitor requests via shared secret. */
export function isAuthorizedCronRequest(request) {
  const secret = process.env.CRON_SECRET || process.env.ADMIN_SECRET;
  if (!secret) return false;

  const header =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    request.headers.get("x-cron-secret");

  return Boolean(header && header === secret);
}
