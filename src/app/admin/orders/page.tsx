"use client";

import { Suspense, useState, useCallback, useEffect } from "react";
import { ArrowDownUp, Filter, Search, X } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

import { useOrders } from "@/hooks/use-orders";
import type { OrderStatus, PaymentStatus } from "@/lib/type";

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

import { OrderTable } from "./_components/order-table";
import { OrderTableSkeleton } from "./_components/order-table-skeleton";
import { OrderEmptyState } from "./_components/order-empty-state";

function OrdersPageContent() {
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
  const [status, setStatus] = useQueryState(
    "status",
    parseAsString.withDefault(""),
  );
  const [paymentStatus, setPaymentStatus] = useQueryState(
    "payment_status",
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
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(!!paymentStatus);

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
  const { data: ordersData, isLoading } = useOrders({
    page,
    limit,
    search: search || undefined,
    status: status as OrderStatus,
    payment_status: paymentStatus as PaymentStatus,
    sort_by: sortBy as string,
    sort_order: sortOrder as string,
  });

  const orders = ordersData?.data ?? [];
  const meta = ordersData?.meta;

  const allFilterValues = [search, status, paymentStatus];
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

  const handleStatusChange = useCallback(
    (value: string) => {
      setStatus(value === "all" ? null : value);
      setPage(1);
    },
    [setStatus, setPage],
  );

  const handlePaymentStatusChange = useCallback(
    (value: string) => {
      setPaymentStatus(value === "all" ? null : value);
      setPage(1);
    },
    [setPaymentStatus, setPage],
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
    setStatus(null);
    setPaymentStatus(null);
    setSortBy("created_at");
    setSortOrder("desc");
    setPage(1);
  }, [
    setSearch,
    setStatus,
    setPaymentStatus,
    setSortBy,
    setSortOrder,
    setPage,
  ]);

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

  const hasAdvancedFilters = !!paymentStatus;
  const advancedFilterCount = [paymentStatus].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground">
            Manage customer orders and track fulfillment.
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
                placeholder="Search by order ID, customer name, or phone..."
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
            {/* Status Filter */}
            <Select value={status || "all"} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full sm:w-36 bg-background">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="SHIPPED">Shipped</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="RETURNED">Returned</SelectItem>
              </SelectContent>
            </Select>

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
                <SelectItem value="total_amount">Total Amount</SelectItem>
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

            {/* More Filters Toggle */}
            <Collapsible
              open={moreFiltersOpen}
              onOpenChange={setMoreFiltersOpen}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto h-9 font-normal"
                >
                  <Filter className="size-3.5" />
                  {moreFiltersOpen ? "Hide" : "More"} Filters
                  {hasAdvancedFilters && (
                    <Badge variant="secondary" className="ml-1">
                      {advancedFilterCount}
                    </Badge>
                  )}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>

          {/* Advanced Filters (Collapsible Content) */}
          <Collapsible open={moreFiltersOpen} onOpenChange={setMoreFiltersOpen}>
            <CollapsibleContent className="bg-background">
              <div className="rounded-md border p-3 sm:p-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Payment Status
                    </Label>
                    <Select
                      value={paymentStatus || "all"}
                      onValueChange={handlePaymentStatusChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="COLLECTED">Collected</SelectItem>
                        <SelectItem value="REFUNDED">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

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

      {/* Content */}
      {isLoading ? (
        <OrderTableSkeleton />
      ) : orders.length === 0 && !hasFilters ? (
        <OrderEmptyState />
      ) : (
        <OrderTable
          key={`table-limit-${limit}`}
          orders={orders}
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

export default function OrdersPage() {
  return (
    <Suspense fallback={<OrderTableSkeleton />}>
      <OrdersPageContent />
    </Suspense>
  );
}
