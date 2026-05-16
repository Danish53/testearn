import { cookies } from "next/headers";

export const ADMIN_COOKIE = "admin_token";

/** 8 hours — matches admin JWT TTL */
const MAX_AGE = 60 * 60 * 8;

export async function setAdminCookie(token) {
  const store = await cookies();
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearAdminCookie() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}

export async function getAdminTokenFromCookie() {
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value ?? null;
}
