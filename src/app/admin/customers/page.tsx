"use client";

import { Suspense, useState, useCallback, useEffect } from "react";
import { ArrowDownUp, Search, X } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

import { useCustomers } from "@/hooks/use-customers";

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

import { CustomerTable } from "./_components/customer-table";
import { CustomerTableSkeleton } from "./_components/customer-table-skeleton";
import { CustomerEmptyState } from "./_components/customer-empty-state";

function CustomersPageContent() {
  // ── URL State (Nuqs) ─────────────────────────────────
  const [pageParam, setPage] = useQueryState("page", parseAsInteger);
  const [limitParam, setLimit] = useQueryState("limit", parseAsInteger);

  // Use defaults if not set in URL
  const page = pageParam ?? 1;
  const limit = limitParam ?? 10;
  const [search, setSearch] = useQueryState(
    "search",
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
  const [searchInput, setSearchInput] = useState(search);

  // ── Initialize URL Params ─────────────────────────────
  useEffect(() => {
    // Ensure default page and limit are in URL on initial load or navigation
    if (pageParam === null) {
      setPage(1);
    }
    if (limitParam === null) {
      setLimit(10);
    }
  }, [pageParam, limitParam, setPage, setLimit]);

  // ── Data ──────────────────────────────────────────────
  const { data: customersData, isLoading } = useCustomers({
    page,
    limit,
    search: search || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  const customers = customersData?.data ?? [];
  const meta = customersData?.meta;

  const allFilterValues = [search];
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
    setSortBy("created_at");
    setSortOrder("desc");
    setPage(1);
  }, [setSearch, setSortBy, setSortOrder, setPage]);

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
          <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground">
            View and manage your customer database.
          </p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="rounded-lg border bg-card p-3 shadow-sm sm:p-4">
        <div className="space-y-3">
          {/* Row 1: Search + Clear */}
          <div className="flex items-center gap-2">
            <form
              onSubmit={handleSearch}
              className="relative flex-1"
            >
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search by name, phone, or email..."
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
          </div>

          {/* Row 2: Filter controls - responsive grid */}
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-2">
            {/* Sort By */}
            <Select
              value={sortBy || "created_at"}
              onValueChange={handleSortByChange}
            >
              <SelectTrigger className="w-full sm:w-40 bg-background">
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
              <SelectTrigger className="w-full sm:w-32 bg-background">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Descending</SelectItem>
                <SelectItem value="asc">Ascending</SelectItem>
              </SelectContent>
            </Select>

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="shrink-0"
              >
                <X className="size-3.5" />
                <span>Clear</span>
                <Badge variant="secondary" className="ml-0.5">
                  {activeFilterCount}
                </Badge>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <CustomerTableSkeleton />
      ) : customers.length === 0 && !hasFilters ? (
        <CustomerEmptyState />
      ) : (
        <CustomerTable
          key={`table-limit-${limit}`}
          customers={customers}
          pageCount={meta?.total_pages ?? 0}
          pageIndex={(meta?.page ?? 1) - 1}
          pageSize={limit}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
}

export default function CustomersPage() {
  return (
    <Suspense fallback={<CustomerTableSkeleton />}>
      <CustomersPageContent />
    </Suspense>
  );
}
