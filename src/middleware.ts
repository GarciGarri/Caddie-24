import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Auth middleware - temporarily permissive for development without DB
// TODO: Re-enable full auth when PostgreSQL is connected
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // In development without DB: allow all routes
  // When ready for auth, switch to the auth() wrapper from @/lib/auth
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
