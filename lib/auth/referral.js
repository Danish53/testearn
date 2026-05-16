export function buildReferralCode(username) {
  const base = username.replace(/[^a-z0-9]/gi, "").slice(0, 4).toUpperCase() || "USR";
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base}${suffix}`;
}
