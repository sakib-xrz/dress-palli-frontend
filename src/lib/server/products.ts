import "server-only";

import { BACKEND_API_URL } from "@/lib/auth";
import type { PublicProduct, PaginatedResponse } from "@/lib/type";

export async function getServerFeaturedProducts(): Promise<PublicProduct[]> {
  try {
    const response = await fetch(
      `${BACKEND_API_URL}/products?is_featured=true&limit=8`,
      {
        method: "GET",
        next: { revalidate: 300 },
      },
    );

    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as PaginatedResponse<PublicProduct>;
    return data.data ?? [];
  } catch {
    return [];
  }
}
