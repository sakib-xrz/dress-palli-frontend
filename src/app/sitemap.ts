import type { MetadataRoute } from "next";
import { BACKEND_API_URL } from "@/lib/auth";
import type {
  ApiResponse,
  Category,
  PaginatedResponse,
  PublicProduct,
} from "@/lib/type";

const SITE_URL = "https://www.dresspalli.com";

async function getCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${BACKEND_API_URL}/categories/public`, {
      cache: "no-store",
    });
    if (!response.ok) return [];
    const data = (await response.json()) as ApiResponse<Category[]>;
    return data.data || [];
  } catch {
    return [];
  }
}

async function getProducts(): Promise<PublicProduct[]> {
  try {
    const response = await fetch(
      `${BACKEND_API_URL}/products?page=1&limit=1000`,
      {
        cache: "no-store",
      },
    );
    if (!response.ok) return [];
    const data = (await response.json()) as PaginatedResponse<PublicProduct>;
    return data.data || [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/track-order`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = categories
    .filter((cat) => cat.is_active)
    .map((category) => ({
      url: `${SITE_URL}/products?category=${category.slug}`,
      lastModified: new Date(category.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  // Product pages
  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/products/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
