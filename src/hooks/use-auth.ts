"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

// ── Types ───────────────────────────────────────────────────

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN";
  created_at: string;
};

// ── Fetch current user ──────────────────────────────────────

async function fetchAuthUser(): Promise<AuthUser> {
  const response = await fetch("/api/auth/me");

  if (!response.ok) {
    throw new Error("Not authenticated");
  }

  const data = await response.json();
  return data.data;
}

/**
 * Hook to get the currently authenticated user.
 * Cached for 5 minutes via React Query.
 */
export function useAuthUser() {
  return useQuery({
    queryKey: ["auth-user"],
    queryFn: fetchAuthUser,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

// ── Logout ──────────────────────────────────────────────────

/**
 * Hook that provides a logout function.
 * Clears the server-side HttpOnly cookie and all cached data,
 * then redirects to the login page.
 */
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      // Always clear client state and redirect, even if the request fails
      queryClient.clear();
      router.push("/login");
    }
  }, [router, queryClient]);

  return { logout, isLoggingOut };
}
