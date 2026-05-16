/** User's referral code is their username in uppercase (alphanumeric only). */
export function referralCodeFromUsername(username) {
  return String(username)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .toUpperCase();
}

export function isValidUsername(username) {
  const u = String(username).trim().toLowerCase();
  return u.length >= 3 && u.length <= 32 && /^[a-z0-9]+$/.test(u);
}

export function buildRegisterReferralUrl(origin, code) {
  const base = String(origin || "").replace(/\/$/, "");
  return `${base}/register?ref=${encodeURIComponent(code)}`;
}
