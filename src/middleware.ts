import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth?.user;
  const role = req.auth?.user?.role ?? "user";
  const pathname = nextUrl.pathname;

  // Auth pages (always accessible)
  const authPaths = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/verify",
  ];
  const isAuthPage = authPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  // Public API routes
  const publicApiPaths = [
    "/api/auth/signup",
    "/api/auth/verify",
    "/api/auth/login",
    "/api/auth/forgot-password",
    "/api/auth/reset-password",
    "/api/auth/[...nextauth]",
  ];
  const isPublicApi = publicApiPaths.some(
    (p) => pathname === p || pathname.startsWith(p)
  );

  // API routes that require authentication
  const protectedApiPaths = ["/api/user", "/api/admin"];
  const isProtectedApi = protectedApiPaths.some(
    (p) => pathname === p || pathname.startsWith(p)
  );

  // Serve static assets directly
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/fonts") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Allow public API and auth pages
  if (isPublicApi || isAuthPage) {
    return NextResponse.next();
  }

  // Protected API routes
  if (isProtectedApi) {
    if (!isLoggedIn) {
      return new NextResponse(
        JSON.stringify({ error: "Authentication required" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Admin-only API routes
    if (pathname.startsWith("/api/admin") && role !== "admin") {
      return new NextResponse(
        JSON.stringify({ error: "Admin access required" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }

  // Protected page routes
  if (!isLoggedIn && !isAuthPage) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin-only pages
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match all request paths except for:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};