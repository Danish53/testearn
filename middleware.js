import { NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth/admin-jwt";
import { verifyAuthToken } from "@/lib/auth/jwt";
import { ADMIN_COOKIE } from "@/lib/api/admin-cookie";
import { AUTH_COOKIE } from "@/lib/api/auth-cookie";

const PUBLIC_PATHS = ["/login", "/register", "/verify-otp"];

function loginRedirect(request, pathname) {
  const login = new URL("/login", request.url);
  if (pathname && pathname !== "/") {
    login.searchParams.set("from", pathname);
  }
  return NextResponse.redirect(login);
}

function isPublicPath(pathname) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

async function hasValidUserSession(request) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) return false;
  try {
    await verifyAuthToken(token);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      return NextResponse.redirect(loginRedirect(request, "/admin"));
    }

    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    if (!token) {
      return NextResponse.redirect(loginRedirect(request, pathname));
    }

    try {
      await verifyAdminToken(token);
      return NextResponse.next();
    } catch {
      const res = NextResponse.redirect(loginRedirect(request, pathname));
      res.cookies.delete(ADMIN_COOKIE);
      return res;
    }
  }

  const loggedIn = await hasValidUserSession(request);

  if (isPublicPath(pathname)) {
    if (loggedIn) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (pathname === "/" || pathname.startsWith("/dashboard")) {
    if (!loggedIn) {
      return loginRedirect(request, pathname);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/register", "/verify-otp", "/dashboard/:path*", "/admin", "/admin/:path*"],
};
