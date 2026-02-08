import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

// ── Cookie Configuration ────────────────────────────────────
// Using a non-descriptive name to avoid revealing purpose
export const AUTH_COOKIE_NAME = "__dp_sid";

export function getAuthCookieOptions(maxAge: number): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  };
}

// ── Backend API URL (Server-only — never exposed to client) ─
export const BACKEND_API_URL =
  process.env.BACKEND_API_URL || "http://192.168.0.53:8000/api/v1";

// ── JWT Helpers ─────────────────────────────────────────────

/**
 * Decode JWT payload without verifying signature.
 * Used only to read expiry claim — actual verification is done by the backend.
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64Payload = token.split(".")[1];
    if (!base64Payload) return null;
    const payload = Buffer.from(base64Payload, "base64").toString("utf-8");
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

/**
 * Check if a JWT token is expired based on its `exp` claim.
 * Returns true if expired or if the token cannot be decoded.
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") return true;
  // Add 30-second buffer to account for clock skew
  return payload.exp * 1000 < Date.now() + 30_000;
}
