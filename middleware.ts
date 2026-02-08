import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "__dp_sid";

// Paths that require authentication
const PROTECTED_PREFIXES = ["/admin"];

// Paths that authenticated users should be redirected away from
const AUTH_PAGES = ["/login"];

/**
 * Decode JWT expiry without verifying signature.
 * Verification is done server-side by the backend on every API call.
 * This is a fast, edge-compatible check to avoid showing stale pages.
 */
function isTokenExpired(token: string): boolean {
  try {
    const base64Payload = token.split(".")[1];
    if (!base64Payload) return true;

    // Edge-compatible base64 decode (no Buffer in Edge Runtime)
    const jsonStr = atob(base64Payload);
    const payload = JSON.parse(jsonStr);

    if (typeof payload.exp !== "number") return true;
    // 30-second buffer for clock skew
    return payload.exp * 1000 < Date.now() + 30_000;
  } catch {
    return true;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));

  // ── Protected routes: require valid, non-expired token ────
  if (isProtected) {
    if (!token || isTokenExpired(token)) {
      const loginUrl = new URL("/login", request.url);
      // Preserve the intended destination so we can redirect back after login
      loginUrl.searchParams.set("callbackUrl", pathname);

      const response = NextResponse.redirect(loginUrl);

      // If there was a stale cookie, clear it
      if (token) {
        response.cookies.set(AUTH_COOKIE_NAME, "", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 0,
        });
      }

      return response;
    }
  }

  // ── Auth pages: redirect authenticated users to dashboard ─
  if (isAuthPage && token && !isTokenExpired(token)) {
    return NextResponse.redirect(
      new URL("/admin/dashboard", request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
