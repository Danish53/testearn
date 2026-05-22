/** Lowercase + trim — use for all auth email lookups and storage. */
export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}
