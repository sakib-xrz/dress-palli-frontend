import "server-only";

import { BACKEND_API_URL } from "@/lib/auth";
import type { ApiResponse, Category } from "@/lib/type";

export async function getServerPublicCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${BACKEND_API_URL}/categories/public`, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as ApiResponse<Category[]>;
    return data.data ?? [];
  } catch {
    return [];
  }
}
