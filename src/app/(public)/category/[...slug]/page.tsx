import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { BACKEND_API_URL } from "@/lib/auth";
import { getServerPublicCategories } from "@/lib/server/categories";
import type { Category, PaginatedResponse, PublicProduct } from "@/lib/type";
import ProductsListing from "../../products/_components/products-listing";

const PRODUCTS_PER_PAGE = 12;

const SORT_MAP: Record<string, { sort_by: string; sort_order: string }> = {
  newest: { sort_by: "created_at", sort_order: "desc" },
  oldest: { sort_by: "created_at", sort_order: "asc" },
  price_asc: { sort_by: "sell_price", sort_order: "asc" },
  price_desc: { sort_by: "sell_price", sort_order: "desc" },
  name_asc: { sort_by: "name", sort_order: "asc" },
  name_desc: { sort_by: "name", sort_order: "desc" },
};

const EMPTY_RESPONSE: PaginatedResponse<PublicProduct> = {
  success: false,
  statusCode: 500,
  message: "Failed to fetch products",
  data: [],
  meta: { page: 1, limit: PRODUCTS_PER_PAGE, total: 0, total_pages: 0 },
  timestamp: new Date().toISOString(),
};

type SearchParams = {
  search?: string;
  sort?: string;
  min_price?: string;
  max_price?: string;
};

type Props = {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function pickString(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function findCategoryBySlug(categories: Category[], targetSlug: string) {
  for (const category of categories) {
    if (category.slug === targetSlug) return category;
    const matchedChild = category.children?.find(
      (child) => child.slug === targetSlug,
    );
    if (matchedChild) {
      return {
        ...matchedChild,
        image_url: null,
        parent_id: category.id,
        created_at: "",
        updated_at: "",
      } as Category;
    }
  }
  return null;
}

async function fetchProductsByCategorySlug(
  categorySlug: string,
  params: SearchParams,
): Promise<PaginatedResponse<PublicProduct>> {
  try {
    const sort = SORT_MAP[params.sort || "newest"] || SORT_MAP.newest;
    const qs = new URLSearchParams();
    qs.set("page", "1");
    qs.set("limit", String(PRODUCTS_PER_PAGE));
    qs.set("sort_by", sort.sort_by);
    qs.set("sort_order", sort.sort_order);
    if (params.search) qs.set("search", params.search);
    if (params.min_price) qs.set("min_price", params.min_price);
    if (params.max_price) qs.set("max_price", params.max_price);

    const response = await fetch(
      `${BACKEND_API_URL}/products/category/${encodeURIComponent(categorySlug)}?${qs.toString()}`,
      { method: "GET", cache: "no-store" },
    );

    if (!response.ok) return EMPTY_RESPONSE;
    return response.json();
  } catch {
    return EMPTY_RESPONSE;
  }
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const [{ slug }, rawSearch, categories] = await Promise.all([
    params,
    searchParams,
    getServerPublicCategories(),
  ]);

  const currentSlug = slug[slug.length - 1];
  const category = findCategoryBySlug(categories, currentSlug);
  const search = pickString(rawSearch.search);

  const title = search
    ? `Search: "${search}" in ${category?.name || "Category"} | Dress Palli`
    : `${category?.name || "Category"} | Dress Palli`;

  const description = search
    ? `Browse products matching "${search}" in ${category?.name || "this category"} at Dress Palli.`
    : `Explore products in ${category?.name || "this category"} at Dress Palli.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `/category/${slug.join("/")}`,
    },
    alternates: {
      canonical: `/category/${slug.join("/")}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function CategoryWithProducts({
  params,
  searchParams,
}: Props) {
  const [{ slug }, rawSearch, categories] = await Promise.all([
    params,
    searchParams,
    getServerPublicCategories(),
  ]);

  const currentSlug = slug[slug.length - 1];
  const matchedCategory = findCategoryBySlug(categories, currentSlug);

  if (!matchedCategory) {
    notFound();
  }

  const searchQuery: SearchParams = {
    search: pickString(rawSearch.search),
    sort: pickString(rawSearch.sort),
    min_price: pickString(rawSearch.min_price),
    max_price: pickString(rawSearch.max_price),
  };

  const [initialProducts] = await Promise.all([
    fetchProductsByCategorySlug(currentSlug, searchQuery),
  ]);

  const parentCategories = categories.filter(
    (cat) => cat.parent_id === null && cat.is_active,
  );

  return (
    <Suspense>
      <ProductsListing
        initialProducts={initialProducts}
        categories={parentCategories}
        endpointBase={`/products/category/${encodeURIComponent(currentSlug)}`}
        fallbackTitle={matchedCategory.name}
        showFilters={false}
        gridClassName="lg:grid-cols-4"
      />
    </Suspense>
  );
}
