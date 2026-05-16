import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const AUTH_ROUTES = ["/login", "/register", "/verify-otp"];
const PROTECTED_PREFIX = "/dashboard";

function getSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET || "dev-jwt-secret-change-me");
}

async function isTokenValid(token) {
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;
  const valid = token ? await isTokenValid(token) : false;

  const isProtected = pathname === PROTECTED_PREFIX || pathname.startsWith(`${PROTECTED_PREFIX}/`);
  const isAuthPage = AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));

  if (isProtected && !valid) {
    const login = new URL("/login", request.url);
    login.searchParams.set("from", pathname);
    return NextResponse.redirect(login);
  }

  if (isAuthPage && valid) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register", "/verify-otp"],
};
