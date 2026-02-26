import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Public routes — no auth required
  const isPublicRoute =
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/webhook/whatsapp") ||
    pathname === "/login";

  if (isPublicRoute) return;

  // Redirect root to dashboard
  if (pathname === "/") {
    return Response.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  // Redirect unauthenticated users to login
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
