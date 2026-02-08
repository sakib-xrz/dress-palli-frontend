import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, getAuthCookieOptions } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  // Clear the auth cookie by setting maxAge to 0
  response.cookies.set(AUTH_COOKIE_NAME, "", getAuthCookieOptions(0));

  return response;
}
