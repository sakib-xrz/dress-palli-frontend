import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  BACKEND_API_URL,
  getAuthCookieOptions,
} from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 },
    );
  }

  try {
    const backendResponse = await fetch(`${BACKEND_API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    const data = await backendResponse.json();

    // If backend says unauthorized, clear the stale cookie
    if (backendResponse.status === 401) {
      const response = NextResponse.json(data, { status: 401 });
      response.cookies.set(AUTH_COOKIE_NAME, "", getAuthCookieOptions(0));
      return response;
    }

    return NextResponse.json(data, { status: backendResponse.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
