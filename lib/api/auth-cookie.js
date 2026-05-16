import { cookies } from "next/headers";

export const AUTH_COOKIE = "auth_token";

export async function setAuthCookie(token) {
  const store = await cookies();
  store.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAuthCookie() {
  const store = await cookies();
  store.delete(AUTH_COOKIE);
}

export async function getAuthTokenFromCookie() {
  const store = await cookies();
  return store.get(AUTH_COOKIE)?.value ?? null;
}
