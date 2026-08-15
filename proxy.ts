import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get("better-auth.session_token");
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/chat") && !sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (
    (pathname.startsWith("/login") || pathname.startsWith("/signup")) &&
    sessionCookie
  ) {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/chat/:path*", "/login", "/signup", "/"],
};
