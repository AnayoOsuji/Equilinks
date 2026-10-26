import { NextResponse, type NextRequest } from "next/server";
import { safeInternalPath } from "@/lib/auth-paths";
import { decryptSession, SESSION_COOKIE } from "@/lib/session-token";

function isProtected(pathname: string) {
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/school-admin" ||
    pathname.startsWith("/school-admin/") ||
    pathname === "/super-admin" ||
    pathname.startsWith("/super-admin/") ||
    pathname === "/home" ||
    pathname.startsWith("/home/") ||
    pathname === "/educator" ||
    pathname.startsWith("/educator/") ||
    pathname === "/parents" ||
    pathname.startsWith("/parents/")
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!isProtected(pathname)) {
    return NextResponse.next();
  }

  const session = await decryptSession(request.cookies.get(SESSION_COOKIE)?.value);
  if (session) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  const next = safeInternalPath(pathname);
  if (next) loginUrl.searchParams.set("next", next);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/admin",
    "/school-admin/:path*",
    "/school-admin",
    "/super-admin/:path*",
    "/super-admin",
    "/home/:path*",
    "/home",
    "/educator/:path*",
    "/educator",
    "/parents/:path*",
    "/parents",
  ],
};
