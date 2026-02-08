"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, X } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import type { AdminProduct } from "@/lib/type";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ProductTable } from "./_components/product-table";
import { ProductTableSkeleton } from "./_components/product-table-skeleton";
import { ProductEmptyState } from "./_components/product-empty-state";
import { DeleteProductDialog } from "./_components/delete-product-dialog";
import { ProductDetailView } from "./_components/product-detail-view";

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

  // ── Local State ───────────────────────────────────────
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailViewOpen, setDetailViewOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(
    null,
  );
  const [searchInput, setSearchInput] = useState(search);

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
  });

  const products = productsData?.data ?? [];
  const meta = productsData?.meta;
  const hasFilters = !!(search || categoryId || status);
  const activeFilterCount = [search, categoryId, status].filter(Boolean).length;

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

  const handleClearFilters = useCallback(() => {
    setSearchInput("");
    setSearch(null);
    setCategoryId(null);
    setStatus(null);
    setPage(1);
  }, [setSearch, setCategoryId, setStatus, setPage]);

  const handleDelete = (product: AdminProduct) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleViewDetails = (product: AdminProduct) => {
    setSelectedProduct(product);
    setDetailViewOpen(true);
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">
            Manage your products, variants, and inventory.
            {meta?.total !== undefined && (
              <span> &middot; {meta.total} total products</span>
            )}
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
    </div>
  );
}
