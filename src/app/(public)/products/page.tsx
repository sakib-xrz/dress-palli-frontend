import type { Metadata } from "next";
import { Suspense } from "react";
import { BACKEND_API_URL } from "@/lib/auth";
import { getServerPublicCategories } from "@/lib/server/categories";
import type { PaginatedResponse, PublicProduct } from "@/lib/type";
import ProductsListing from "./_components/products-listing";

// ── Constants ───────────────────────────────────────────────

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

// ── Helpers ─────────────────────────────────────────────────

type SearchParams = {
  search?: string;
  category?: string;
  sort?: string;
  min_price?: string;
  max_price?: string;
};

function pickString(
  value: string | string[] | undefined,
): string | undefined {
  return typeof value === "string" ? value : undefined;
}

async function fetchProducts(
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
    if (params.category) qs.set("category_id", params.category);
    if (params.min_price) qs.set("min_price", params.min_price);
    if (params.max_price) qs.set("max_price", params.max_price);

    const response = await fetch(
      `${BACKEND_API_URL}/products?${qs.toString()}`,
      { method: "GET", cache: "no-store" },
    );

    if (!response.ok) return EMPTY_RESPONSE;
    return response.json();
  } catch {
    return EMPTY_RESPONSE;
  }
}

// ── Metadata ────────────────────────────────────────────────

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const raw = await searchParams;
  const search = pickString(raw.search);

  const title = search
    ? `Search: "${search}" | Dress Palli`
    : "Shop All Products | Dress Palli";

  const description = search
    ? `Browse products matching "${search}" at Dress Palli. Find the best deals on dresses, kurtis, three-pieces, and more.`
    : "Explore our complete collection of dresses, kurtis, three-pieces, lehengas, and more at Dress Palli. Quality fashion at the best prices.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: "/products",
    },
    alternates: {
      canonical: "/products",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// ── Page ────────────────────────────────────────────────────

export default async function ProductsPage({ searchParams }: Props) {
  const raw = await searchParams;
  const params: SearchParams = {
    search: pickString(raw.search),
    category: pickString(raw.category),
    sort: pickString(raw.sort),
    min_price: pickString(raw.min_price),
    max_price: pickString(raw.max_price),
  };

  const [initialProducts, categories] = await Promise.all([
    fetchProducts(params),
    getServerPublicCategories(),
  ]);

  const parentCategories = categories.filter(
    (cat) => cat.parent_id === null && cat.is_active,
  );

  // Structured data for SEO
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: params.search ? `Search: "${params.search}"` : "All Products",
    description:
      "Browse our complete product collection at Dress Palli.",
    url: "/products",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: initialProducts.meta?.total ?? 0,
      itemListElement: initialProducts.data.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Product",
          name: product.name,
          url: `/products/${product.slug}`,
          image: product.primary_image?.url,
          offers: {
            "@type": "Offer",
            price: product.effective_price,
            priceCurrency: "BDT",
          },
        },
      })),
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "/" },
      {
        "@type": "ListItem",
        position: 2,
        name: "Products",
        item: "/products",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
      <Suspense>
        <ProductsListing
          initialProducts={initialProducts}
          categories={parentCategories}
        />
      </Suspense>
    </>
  );
}
