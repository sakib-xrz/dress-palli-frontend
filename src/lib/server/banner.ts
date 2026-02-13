import "server-only";

import { BACKEND_API_URL } from "@/lib/auth";
import type { ApiResponse, Banner } from "@/lib/type";

export async function getServerBanners(): Promise<Banner[]> {
  try {
    const response = await fetch(`${BACKEND_API_URL}/banners`, {
      method: "GET",
      next: { revalidate: 300 }, // Revalidate every 5 minutes
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
