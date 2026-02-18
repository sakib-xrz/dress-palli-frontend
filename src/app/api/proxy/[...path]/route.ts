import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  BACKEND_API_URL,
  getAuthCookieOptions,
} from "@/lib/auth";

/**
 * Public routes that don't require authentication.
 * These endpoints can be accessed without a token.
 */
const PUBLIC_ROUTES = ["/cart", "/orders", "/products/search"];

/**
 * Catch-all API proxy.
 *
 * Reads the HttpOnly auth cookie, attaches it as a Bearer token,
 * and forwards the request to the backend. The client never sees
 * the raw JWT or the backend URL.
 */
async function proxyRequest(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  // Build target path to check if it's a public route
  const targetPath = `/${path.join("/")}`;
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    targetPath.startsWith(route),
  );

  // Only require authentication for non-public routes
  if (!token && !isPublicRoute) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 },
    );
  }

  // Build target URL
  const backendPath = path.join("/");
  const url = new URL(`${BACKEND_API_URL}/${backendPath}`);

  // Forward query parameters
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.append(key, value);
  });

  // Build headers — only forward what's necessary
  const headers: HeadersInit = {};

  // Only add Authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const contentType = request.headers.get("content-type");
  if (contentType && !["GET", "HEAD"].includes(request.method)) {
    headers["Content-Type"] = contentType;
  }

  // Forward body for non-GET/HEAD requests (handles JSON + multipart)
  let body: ArrayBuffer | null = null;
  if (!["GET", "HEAD"].includes(request.method)) {
    body = await request.arrayBuffer();
  }

  try {
    const backendResponse = await fetch(url.toString(), {
      method: request.method,
      headers,
      body,
    });

    // If backend says 401, clear the stale cookie
    if (backendResponse.status === 401) {
      const responseBody = await backendResponse.arrayBuffer();
      const response = new NextResponse(responseBody, {
        status: 401,
        headers: {
          "Content-Type":
            backendResponse.headers.get("Content-Type") || "application/json",
        },
      });
      response.cookies.set(AUTH_COOKIE_NAME, "", getAuthCookieOptions(0));
      return response;
    }

    // Forward the backend response as-is
    const responseBody = await backendResponse.arrayBuffer();
    return new NextResponse(responseBody, {
      status: backendResponse.status,
      headers: {
        "Content-Type":
          backendResponse.headers.get("Content-Type") || "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Backend service unavailable" },
      { status: 502 },
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
