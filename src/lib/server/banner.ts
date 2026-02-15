import "server-only";

import { BACKEND_API_URL } from "@/lib/auth";
import type { ApiResponse, Banner } from "@/lib/type";

export async function getServerBanners(): Promise<Banner[]> {
  try {
    const response = await fetch(`${BACKEND_API_URL}/banners`, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as ApiResponse<Banner[]>;
    return data.data ?? [];
  } catch {
    return [];
  }
}
