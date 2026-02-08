import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  BACKEND_API_URL,
  decodeJwtPayload,
  getAuthCookieOptions,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Forward login request to backend
    const backendResponse = await fetch(`${BACKEND_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await backendResponse.json();

    // If backend returned an error, forward it as-is (no token info leaked)
    if (!backendResponse.ok || !data.success) {
      return NextResponse.json(
        {
          success: false,
          statusCode: data.statusCode || backendResponse.status,
          message: data.message || "Login failed",
        },
        { status: backendResponse.status },
      );
    }

    const { access_token, user } = data.data;

    // Compute cookie maxAge from JWT expiry
    const payload = decodeJwtPayload(access_token);
    const maxAge =
      payload && typeof payload.exp === "number"
        ? payload.exp - Math.floor(Date.now() / 1000)
        : 60 * 60 * 24; // fallback: 24 hours

    // Build response — only user data, never the raw token
    const response = NextResponse.json({
      success: true,
      message: data.message,
      data: { user },
    });

    // Set HttpOnly cookie with the JWT
    response.cookies.set(
      AUTH_COOKIE_NAME,
      access_token,
      getAuthCookieOptions(maxAge),
    );

    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
