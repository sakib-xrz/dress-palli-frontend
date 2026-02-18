"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { parseAsString, useQueryStates } from "nuqs";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";
import type { Category, PaginatedResponse, PublicProduct } from "@/lib/type";
import ProductCard from "@/components/shared/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  IconSearch,
  IconAdjustmentsHorizontal,
  IconX,
  IconChevronRight,
  IconHome2,
  IconLoader2,
  IconMoodEmpty,
} from "@tabler/icons-react";

// ── Constants ───────────────────────────────────────────────

const PRODUCTS_PER_PAGE = 12;

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A to Z" },
  { value: "name_desc", label: "Name: Z to A" },
] as const;

const SORT_MAP: Record<string, { sort_by: string; sort_order: string }> = {
  newest: { sort_by: "created_at", sort_order: "desc" },
  oldest: { sort_by: "created_at", sort_order: "asc" },
  price_asc: { sort_by: "sell_price", sort_order: "asc" },
  price_desc: { sort_by: "sell_price", sort_order: "desc" },
  name_asc: { sort_by: "name", sort_order: "asc" },
  name_desc: { sort_by: "name", sort_order: "desc" },
};

// ── Types ───────────────────────────────────────────────────

type ProductsListingProps = {
  initialProducts: PaginatedResponse<PublicProduct>;
  categories: Category[];
};

// ── Helpers ─────────────────────────────────────────────────

// ── Skeleton ────────────────────────────────────────────────

function ProductCardSkeleton() {
  return (
    <div className="flex flex-col bg-background border border-gray-200 rounded-lg overflow-hidden">
      <div className="aspect-3/4 bg-gray-100 animate-pulse" />
      <div className="lg:p-3.5 p-2 space-y-2.5">
        <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse" />
        <div className="space-y-1.5">
          <div className="h-5 bg-gray-100 rounded w-2/5 animate-pulse" />
          <div className="flex gap-2 pt-1">
            <div className="h-8 bg-gray-100 rounded flex-1 animate-pulse" />
            <div className="h-8 bg-gray-100 rounded flex-1 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Component ───────────────────────────────────────────────

export default function ProductsListing({
  initialProducts,
  categories,
}: ProductsListingProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<Set<string>>(
    () => new Set(),
  );

  // URL state via nuqs (shallow updates, no server re-render)
  const [params, setParams] = useQueryStates(
    {
      search: parseAsString.withDefault(""),
      category: parseAsString.withDefault(""),
      sort: parseAsString.withDefault("newest"),
      min_price: parseAsString.withDefault(""),
      max_price: parseAsString.withDefault(""),
    },
    { shallow: true },
  );
  const [searchInput, setSearchInput] = useState(params.search);
  const [priceRangeInput, setPriceRangeInput] = useState({
    min: params.min_price,
    max: params.max_price,
  });

  useEffect(() => {
    const syncTimer = setTimeout(() => {
      setSearchInput(params.search);
    }, 0);
    return () => clearTimeout(syncTimer);
  }, [params.search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const nextSearch = searchInput.trim();
      const currentSearch = params.search.trim();
      if (nextSearch !== currentSearch) {
        setParams({ search: nextSearch || null });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput, params.search, setParams]);

  useEffect(() => {
    const syncTimer = setTimeout(() => {
      setPriceRangeInput((prev) => {
        const next = { min: params.min_price, max: params.max_price };
        if (prev.min === next.min && prev.max === next.max) return prev;
        return next;
      });
    }, 0);

    return () => clearTimeout(syncTimer);
  }, [params.min_price, params.max_price]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const nextMin = priceRangeInput.min.trim();
      const nextMax = priceRangeInput.max.trim();
      const currentMin = params.min_price.trim();
      const currentMax = params.max_price.trim();

      if (nextMin !== currentMin || nextMax !== currentMax) {
        setParams({
          min_price: nextMin || null,
          max_price: nextMax || null,
        });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [priceRangeInput, params.min_price, params.max_price, setParams]);

  const categoryTree = useMemo(
    () =>
      categories
        .filter((cat) => cat.is_active)
        .map((cat) => ({
          ...cat,
          children: (cat.children ?? []).filter((child) => child.is_active),
        })),
    [categories],
  );

  const getCategoryName = useCallback(
    (id: string) => {
      for (const cat of categoryTree) {
        if (cat.id === id) return cat.name;
        const child = cat.children?.find((sub) => sub.id === id);
        if (child) return child.name;
      }
      return "";
    },
    [categoryTree],
  );

  // Build API params from URL state
  const apiParams = useMemo(() => {
    const sort = SORT_MAP[params.sort] || SORT_MAP.newest;
    const raw: Record<string, string> = {
      sort_by: sort.sort_by,
      sort_order: sort.sort_order,
      limit: String(PRODUCTS_PER_PAGE),
    };
    if (params.search) raw.search = params.search;
    if (params.category) raw.category_id = params.category;
    if (params.min_price) raw.min_price = params.min_price;
    if (params.max_price) raw.max_price = params.max_price;
    return raw;
  }, [
    params.search,
    params.category,
    params.sort,
    params.min_price,
    params.max_price,
  ]);

  const apiParamsKey = useMemo(() => JSON.stringify(apiParams), [apiParams]);
  const [initialApiParamsKey] = useState(apiParamsKey);

  // Infinite query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
  } = useInfiniteQuery({
    queryKey: ["public-products", apiParamsKey],
    queryFn: async ({ pageParam }) => {
      const response: PaginatedResponse<PublicProduct> = await api.get(
        "/products",
        { params: { ...apiParams, page: pageParam } },
      );
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta) return undefined;
      const { page, total_pages } = lastPage.meta;
      return page < total_pages ? page + 1 : undefined;
    },
    initialData:
      apiParamsKey === initialApiParamsKey
        ? {
            pages: [initialProducts],
            pageParams: [1],
          }
        : undefined,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });

  const products = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );
  const totalProducts = data?.pages[0]?.meta?.total ?? 0;

  // Intersection observer for infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "300px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Filter state helpers
  const activeFilterCount = [
    params.category,
    params.min_price,
    params.max_price,
  ].filter(Boolean).length;

  const hasActiveFilters =
    !!params.search ||
    !!params.category ||
    !!params.min_price ||
    !!params.max_price;

  const isRefreshing = isFetching && !isFetchingNextPage && !isLoading;

  const clearAllFilters = () => {
    setSearchInput("");
    setPriceRangeInput({ min: "", max: "" });
    setParams({
      search: null,
      category: null,
      sort: null,
      min_price: null,
      max_price: null,
    });
  };

  const removeFilter = (key: keyof typeof params) => {
    if (key === "search") setSearchInput("");
    if (key === "min_price" || key === "max_price") {
      setPriceRangeInput((prev) => ({
        ...prev,
        [key === "min_price" ? "min" : "max"]: "",
      }));
    }
    setParams({ [key]: null });
  };

  // ── Filter panel content ──────────────────────────────────

  const filterContent = (
    <div className="space-y-6 lg:bg-gray-50 lg:p-4 max-lg:px-4">
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Price Range
        </h4>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={priceRangeInput.min}
            onChange={(e) =>
              setPriceRangeInput((prev) => ({ ...prev, min: e.target.value }))
            }
            className="flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            min={0}
          />
          <span className="text-gray-400 text-sm shrink-0">—</span>
          <Input
            type="number"
            placeholder="Max"
            value={priceRangeInput.max}
            onChange={(e) =>
              setPriceRangeInput((prev) => ({ ...prev, max: e.target.value }))
            }
            className="flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            min={0}
          />
        </div>
      </div>

      <Separator />

      {categoryTree.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Category
          </h4>
          <div className="space-y-0.5">
            <button
              type="button"
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                !params.category
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              )}
              onClick={() => setParams({ category: null })}
            >
              All Categories
            </button>
            {categoryTree.map((cat) => {
              const isParentSelected = params.category === cat.id;
              const isExpanded = expandedCategoryIds.has(cat.id);

              return (
                <div key={cat.id} className="space-y-1">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className={cn(
                        "flex-1 text-left px-3 py-2 rounded-lg text-sm transition-colors",
                        isParentSelected
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                      )}
                      onClick={() => {
                        if (cat.children?.length) {
                          setExpandedCategoryIds((prev) => {
                            const next = new Set(prev);
                            if (isExpanded && isParentSelected)
                              next.delete(cat.id);
                            else next.add(cat.id);
                            return next;
                          });
                        }
                        setParams({ category: cat.id });
                      }}
                    >
                      {cat.name}
                    </button>
                    {!!cat.children?.length && (
                      <button
                        type="button"
                        aria-label={
                          isExpanded
                            ? "Collapse subcategories"
                            : "Expand subcategories"
                        }
                        className="p-2 rounded-md text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          setExpandedCategoryIds((prev) => {
                            const next = new Set(prev);
                            if (next.has(cat.id)) next.delete(cat.id);
                            else next.add(cat.id);
                            return next;
                          });
                        }}
                      >
                        <IconChevronRight
                          className={cn(
                            "size-4 transition-transform",
                            isExpanded && "rotate-90",
                          )}
                        />
                      </button>
                    )}
                  </div>

                  {isExpanded && !!cat.children?.length && (
                    <div className="ml-2 border-l border-gray-200 pl-2 space-y-1">
                      {cat.children.map((child) => (
                        <button
                          key={child.id}
                          type="button"
                          className={cn(
                            "w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors",
                            params.category === child.id
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                          )}
                          onClick={() => {
                            setExpandedCategoryIds((prev) => {
                              const next = new Set(prev);
                              next.add(cat.id);
                              return next;
                            });
                            setParams({ category: child.id });
                          }}
                        >
                          {child.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {hasActiveFilters && (
        <>
          <Separator />
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="w-full"
          >
            Clear All Filters
          </Button>
        </>
      )}
    </div>
  );

  // ── Render ────────────────────────────────────────────────

  return (
    <section className="min-h-[calc(100vh-10rem)]">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:py-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
            <li>
              <Link
                href="/"
                className="hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                <IconHome2 className="size-3.5" />
                <span className="hidden sm:inline">Home</span>
              </Link>
            </li>
            <li>
              <IconChevronRight className="size-3" />
            </li>
            <li className="text-foreground font-medium">Products</li>
          </ol>
        </nav>

        {/* Page heading */}
        <div className="mb-5 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-serif">
            {params.search
              ? `Search: "${params.search}"`
              : params.category
                ? getCategoryName(params.category)
                : "All Products"}
          </h1>
          {!isLoading && (
            <p className="text-sm text-muted-foreground mt-1">
              {totalProducts} {totalProducts === 1 ? "product" : "products"}{" "}
              found
            </p>
          )}
        </div>

        {/* Two-column layout: sidebar + content */}
        <div className="lg:flex lg:gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-[260px] shrink-0">
            <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pb-8 no-scrollbar">
              {filterContent}
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Top bar: Search + Sort + Mobile filter trigger */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              {/* Search */}
              <div className="relative flex-1 min-w-0">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9 h-10"
                  aria-label="Search products"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput("");
                      setParams({ search: null });
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Clear search"
                  >
                    <IconX className="size-4" />
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                {/* Sort */}
                <Select
                  value={params.sort || "newest"}
                  onValueChange={(value) => setParams({ sort: value })}
                >
                  <SelectTrigger className="flex-1 sm:flex-initial sm:w-[180px] h-10!">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Mobile-only filter sheet */}
                <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-10! gap-2 relative lg:hidden"
                    >
                      <IconAdjustmentsHorizontal className="size-4" />
                      <span className="hidden sm:inline">Filters</span>
                      {activeFilterCount > 0 && (
                        <Badge className="absolute -top-2 -right-2 bg-linear-to-r from-pink-500 to-purple-500 text-white border-0 h-5 min-w-5 flex items-center justify-center rounded-full text-[10px] font-bold p-0">
                          {activeFilterCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-[85vw] sm:w-[380px] overflow-hidden"
                    onOpenAutoFocus={(event) => event.preventDefault()}
                  >
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1">
                      {filterContent}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* Active filter chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {params.search && (
                  <Badge variant="secondary" className="gap-1 pr-1 font-normal">
                    Search: &quot;{params.search}&quot;
                    <button
                      onClick={() => removeFilter("search")}
                      className="ml-1 hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                      aria-label="Remove search filter"
                    >
                      <IconX className="size-3" />
                    </button>
                  </Badge>
                )}
                {params.category && (
                  <Badge variant="secondary" className="gap-1 pr-1 font-normal">
                    {getCategoryName(params.category)}
                    <button
                      onClick={() => removeFilter("category")}
                      className="ml-1 hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                      aria-label="Remove category filter"
                    >
                      <IconX className="size-3" />
                    </button>
                  </Badge>
                )}
                {(params.min_price || params.max_price) && (
                  <Badge variant="secondary" className="gap-1 pr-1 font-normal">
                    BDT {params.min_price || "0"} — {params.max_price || "∞"}
                    <button
                      onClick={() => {
                        setPriceRangeInput({ min: "", max: "" });
                        setParams({ min_price: null, max_price: null });
                      }}
                      className="ml-1 hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                      aria-label="Remove price filter"
                    >
                      <IconX className="size-3" />
                    </button>
                  </Badge>
                )}
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Refreshing indicator (filter change) */}
            {isRefreshing && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Array.from({ length: PRODUCTS_PER_PAGE }).map((_, i) => (
                  <ProductCardSkeleton key={`skel-${i}`} />
                ))}
              </div>
            )}

            {/* Product grid / skeletons / empty state */}
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Array.from({ length: PRODUCTS_PER_PAGE }).map((_, i) => (
                  <ProductCardSkeleton key={`skel-${i}`} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-gray-100 rounded-full p-4 mb-4">
                  <IconMoodEmpty className="size-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  No products found
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mb-4">
                  Try adjusting your search or filter criteria to find what
                  you&apos;re looking for.
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" size="sm" onClick={clearAllFilters}>
                    Clear All Filters
                  </Button>
                )}
              </div>
            ) : (
              <div
                className={cn(
                  "grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 transition-opacity duration-200",
                  isRefreshing && "opacity-60 pointer-events-none",
                )}
              >
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Infinite scroll sentinel */}
            <div ref={loadMoreRef} className="h-px" />

            {/* Loading more indicator */}
            {isFetchingNextPage && (
              <div className="flex justify-center py-8">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <IconLoader2 className="size-5 animate-spin" />
                  Loading more products...
                </div>
              </div>
            )}

            {/* End of list */}
            {!hasNextPage && products.length > 0 && !isLoading && (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  You&apos;ve seen all {totalProducts} products
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
