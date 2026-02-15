import "server-only";

import { BACKEND_API_URL } from "@/lib/auth";
import type { PublicProduct, PaginatedResponse } from "@/lib/type";

async function getServerProducts(query: string): Promise<PublicProduct[]> {
  try {
    const response = await fetch(
      `${BACKEND_API_URL}/products?${query}&limit=8`,
      {
        method: "GET",
        cache: "no-store",
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

export async function getServerFeaturedProducts(): Promise<PublicProduct[]> {
  return getServerProducts("is_featured=true");
}

export async function getServerNewProducts(): Promise<PublicProduct[]> {
  return getServerProducts("is_new=true");
}

export async function getServerBestSellingProducts(): Promise<PublicProduct[]> {
  return getServerProducts("is_best_selling=true");
}
