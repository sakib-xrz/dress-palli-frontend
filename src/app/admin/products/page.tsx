"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowDownUp, Filter, Plus, Search, X } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import type { AdminProduct } from "@/lib/type";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { ProductTable } from "./_components/product-table";
import { ProductTableSkeleton } from "./_components/product-table-skeleton";
import { ProductEmptyState } from "./_components/product-empty-state";
import { DeleteProductDialog } from "./_components/delete-product-dialog";
import { ProductDetailView } from "./_components/product-detail-view";
import { ManageImagesModal } from "./_components/manage-images-modal";

export default function ProductsPage() {
  // ── URL State (Nuqs) ─────────────────────────────────
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState(
    "limit",
    parseAsInteger.withDefault(10),
  );
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault(""),
  );
  const [categoryId, setCategoryId] = useQueryState(
    "category",
    parseAsString.withDefault(""),
  );
  const [status, setStatus] = useQueryState(
    "status",
    parseAsString.withDefault(""),
  );
  const [featured, setFeatured] = useQueryState(
    "featured",
    parseAsString.withDefault(""),
  );
  const [newArrival, setNewArrival] = useQueryState(
    "new",
    parseAsString.withDefault(""),
  );
  const [bestSelling, setBestSelling] = useQueryState(
    "best_selling",
    parseAsString.withDefault(""),
  );
  const [sortBy, setSortBy] = useQueryState(
    "sort_by",
    parseAsString.withDefault("created_at"),
  );
  const [sortOrder, setSortOrder] = useQueryState(
    "sort_order",
    parseAsString.withDefault("desc"),
  );

  // ── Local State ───────────────────────────────────────
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailViewOpen, setDetailViewOpen] = useState(false);
  const [manageImagesOpen, setManageImagesOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(
    null,
  );
  const [searchInput, setSearchInput] = useState(search);
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(
    !!(featured || newArrival || bestSelling),
  );

  // ── Data ──────────────────────────────────────────────
  const { data: categoriesData } = useCategories();
  const { data: productsData, isLoading } = useProducts({
    page,
    limit,
    search: search || undefined,
    category_id: categoryId || undefined,
    is_published:
      status === "published"
        ? "true"
        : status === "draft"
          ? "false"
          : undefined,
    is_featured:
      featured === "yes" ? "true" : featured === "no" ? "false" : undefined,
    is_new:
      newArrival === "yes" ? "true" : newArrival === "no" ? "false" : undefined,
    is_best_selling:
      bestSelling === "yes"
        ? "true"
        : bestSelling === "no"
          ? "false"
          : undefined,
    sort_by: sortBy || undefined,
    sort_order: sortOrder || undefined,
  });

  const products = productsData?.data ?? [];
  const meta = productsData?.meta;

  const allFilterValues = [
    search,
    categoryId,
    status,
    featured,
    newArrival,
    bestSelling,
  ];
  const hasFilters = allFilterValues.some(Boolean);
  const activeFilterCount = allFilterValues.filter(Boolean).length;

  // ── Handlers ──────────────────────────────────────────
  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setSearch(searchInput || null);
      setPage(1);
    },
    [searchInput, setSearch, setPage],
  );

  const handleClearSearch = useCallback(() => {
    setSearchInput("");
    setSearch(null);
    setPage(1);
  }, [setSearch, setPage]);

  const handleCategoryChange = useCallback(
    (value: string) => {
      setCategoryId(value === "all" ? null : value);
      setPage(1);
    },
    [setCategoryId, setPage],
  );

  const handleStatusChange = useCallback(
    (value: string) => {
      setStatus(value === "all" ? null : value);
      setPage(1);
    },
    [setStatus, setPage],
  );

  const handleFeaturedChange = useCallback(
    (value: string) => {
      setFeatured(value === "all" ? null : value);
      setPage(1);
    },
    [setFeatured, setPage],
  );

  const handleNewArrivalChange = useCallback(
    (value: string) => {
      setNewArrival(value === "all" ? null : value);
      setPage(1);
    },
    [setNewArrival, setPage],
  );

  const handleBestSellingChange = useCallback(
    (value: string) => {
      setBestSelling(value === "all" ? null : value);
      setPage(1);
    },
    [setBestSelling, setPage],
  );

  const handleSortByChange = useCallback(
    (value: string) => {
      setSortBy(value);
      setPage(1);
    },
    [setSortBy, setPage],
  );

  const handleSortOrderChange = useCallback(
    (value: string) => {
      setSortOrder(value);
      setPage(1);
    },
    [setSortOrder, setPage],
  );

  const handleClearFilters = useCallback(() => {
    setSearchInput("");
    setSearch(null);
    setCategoryId(null);
    setStatus(null);
    setFeatured(null);
    setNewArrival(null);
    setBestSelling(null);
    setSortBy("created_at");
    setSortOrder("desc");
    setPage(1);
  }, [
    setSearch,
    setCategoryId,
    setStatus,
    setFeatured,
    setNewArrival,
    setBestSelling,
    setSortBy,
    setSortOrder,
    setPage,
  ]);

  const handleDelete = (product: AdminProduct) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleViewDetails = (product: AdminProduct) => {
    setSelectedProduct(product);
    setDetailViewOpen(true);
  };

  const handleManageImages = (product: AdminProduct) => {
    setSelectedProduct(product);
    setManageImagesOpen(true);
  };

  const handlePageChange = useCallback(
    (newPageIndex: number) => setPage(newPageIndex + 1),
    [setPage],
  );

  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      setLimit(newPageSize);
      setPage(1);
    },
    [setLimit, setPage],
  );

  const hasAdvancedFilters = !!(featured || newArrival || bestSelling);
  const advancedFilterCount = [featured, newArrival, bestSelling].filter(
    Boolean,
  ).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">
            Manage your products, variants, and inventory.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Filters Toolbar */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="relative flex-1 min-w-[200px] max-w-sm"
          >
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-8 pr-8"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </form>

          {/* Category Filter */}
          <Select
            value={categoryId || "all"}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categoriesData?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={status || "all"} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort By */}
          <Select
            value={sortBy || "created_at"}
            onValueChange={handleSortByChange}
          >
            <SelectTrigger className="w-40">
              <div className="flex items-center gap-1.5">
                <ArrowDownUp className="size-3.5 shrink-0" />
                <SelectValue placeholder="Sort by" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Date Created</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Order */}
          <Select
            value={sortOrder || "desc"}
            onValueChange={handleSortOrderChange}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Descending</SelectItem>
              <SelectItem value="asc">Ascending</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              <X />
              Clear
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            </Button>
          )}
        </div>

        {/* Advanced Filters (Collapsible) */}
        <Collapsible open={moreFiltersOpen} onOpenChange={setMoreFiltersOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="size-3.5" />
              {moreFiltersOpen ? "Hide" : "More"} Filters
              {hasAdvancedFilters && (
                <Badge variant="secondary" className="ml-1">
                  {advancedFilterCount}
                </Badge>
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">
            <div className="rounded-lg border bg-card shadow-sm">
              <div className="grid gap-0">
                {/* Product Tags Section */}
                <div className="space-y-3 p-4">
                  <h4 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Product Tags
                  </h4>
                  <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-3 sm:grid-cols-1 lg:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Featured
                      </Label>
                      <Select
                        value={featured || "all"}
                        onValueChange={handleFeaturedChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="yes">Featured</SelectItem>
                          <SelectItem value="no">Not Featured</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        New Arrival
                      </Label>
                      <Select
                        value={newArrival || "all"}
                        onValueChange={handleNewArrivalChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="yes">New Arrival</SelectItem>
                          <SelectItem value="no">Not New</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Best Selling
                      </Label>
                      <Select
                        value={bestSelling || "all"}
                        onValueChange={handleBestSellingChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="yes">Best Selling</SelectItem>
                          <SelectItem value="no">Not Best Selling</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Content */}
      {isLoading ? (
        <ProductTableSkeleton />
      ) : products.length === 0 && !hasFilters ? (
        <ProductEmptyState />
      ) : (
        <ProductTable
          products={products}
          pageCount={meta?.total_pages ?? 0}
          pageIndex={(meta?.page ?? 1) - 1}
          pageSize={limit}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onDelete={handleDelete}
          onViewDetails={handleViewDetails}
          onManageImages={handleManageImages}
        />
      )}

      {/* Delete Dialog */}
      <DeleteProductDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        product={selectedProduct}
      />

      {/* View Details Modal/Sheet */}
      <ProductDetailView
        open={detailViewOpen}
        onOpenChange={setDetailViewOpen}
        product={selectedProduct}
      />

      {/* Manage Images Modal/Sheet */}
      <ManageImagesModal
        open={manageImagesOpen}
        onOpenChange={setManageImagesOpen}
        product={selectedProduct}
      />
    </div>
  );
}
