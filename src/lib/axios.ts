import axios from "axios";
import { type ApiErrorResponse } from "@/lib/type";

/**
 * Axios instance configured to use the Next.js API proxy.
 *
 * All requests go through /api/proxy/... which:
 *  1. Reads the HttpOnly auth cookie (invisible to JS)
 *  2. Attaches it as a Bearer token to the backend request
 *  3. Forwards the response back to the client
 *
 * This means the client never sees the JWT or the backend URL.
 */
export const api = axios.create({
  baseURL: "/api/proxy",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// No request interceptor needed — the proxy handles auth via HttpOnly cookie

api.interceptors.response.use(
  function onFulfilled(response) {
    const responseObject = { ...response.data };
    return responseObject;
  },
  function onRejected(error) {
    const errorResponse: ApiErrorResponse = {
      success: false,
      statusCode: error.response?.data?.statusCode || 500,
      message: error.response?.data?.message || "An error occurred",
      errors: error.response?.data?.errors || [],
      timestamp: error.response?.data?.timestamp || new Date().toISOString(),
    };

    // Handle 401 — token expired or invalid, redirect to login
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(errorResponse);
  },
);

export default api;
