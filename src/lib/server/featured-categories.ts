import "server-only";

import { BACKEND_API_URL } from "@/lib/auth";
import type { ApiResponse, FeaturedCategoryWithProducts } from "@/lib/type";

export async function getServerFeaturedCategoriesWithProducts(): Promise<
  FeaturedCategoryWithProducts[]
> {
  try {
    const response = await fetch(
      `${BACKEND_API_URL}/featured-categories/with-products`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as ApiResponse<
      FeaturedCategoryWithProducts[]
    >;
    return data.data ?? [];
  } catch {
    return [];
  }
}
