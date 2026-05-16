import { NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth/admin-jwt";
import { ADMIN_COOKIE } from "@/lib/api/admin-cookie";

function loginRedirect(request, pathname) {
  const login = new URL("/login", request.url);
  login.searchParams.set("from", pathname);
  return login;
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

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
    const login = loginRedirect(request, pathname);
    const res = NextResponse.redirect(login);
    res.cookies.delete(ADMIN_COOKIE);
    return res;
  }
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
