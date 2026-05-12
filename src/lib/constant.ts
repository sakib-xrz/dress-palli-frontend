/**
 * Client-safe constants.
 *
 * NOTE: The backend API URL is NOT exposed here. All API traffic is
 * routed through the Next.js proxy (/api/proxy/...) which keeps the
 * backend URL and auth tokens server-side only.
 *
 * For server-only constants (backend URL, cookie config), see lib/auth.ts.
 */

export const APP_NAME = "Dress Point";
