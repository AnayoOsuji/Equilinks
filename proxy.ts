import { NextResponse, type NextRequest } from "next/server";
import { safeSuperAdminPath } from "@/lib/auth-paths";
import { decryptSession, SESSION_COOKIE } from "@/lib/session-token";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname !== "/super-admin" && !pathname.startsWith("/super-admin/")) {
    return NextResponse.next();
  }

  const session = await decryptSession(request.cookies.get(SESSION_COOKIE)?.value);
  if (session?.role === "SUPER_ADMIN") {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", safeSuperAdminPath(pathname));
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/super-admin", "/super-admin/:path*"],
};
