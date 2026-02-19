"use client";

import { Suspense, useState, useCallback, useEffect } from "react";
import { ArrowDownUp, Plus, Search, X } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

import { useAdmins } from "@/hooks/use-admins";
import type { AdminUser } from "@/lib/type";

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

import { AdminTable } from "./_components/admin-table";
import { AdminTableSkeleton } from "./_components/admin-table-skeleton";
import { AdminEmptyState } from "./_components/admin-empty-state";
import { AdminFormModal } from "./_components/admin-form-modal";
import { ResetAdminPasswordDialog } from "./_components/reset-admin-password-dialog";

function AdminsPageContent() {
  const [pageParam, setPage] = useQueryState("page", parseAsInteger);
  const [limitParam, setLimit] = useQueryState("limit", parseAsInteger);

  const page = pageParam ?? 1;
  const limit = limitParam ?? 10;
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault(""),
  );
  const [isActive, setIsActive] = useQueryState(
    "is_active",
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

  const [searchInput, setSearchInput] = useState(search);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);

  useEffect(() => {
    if (pageParam === null) {
      setPage(1);
    }
    if (limitParam === null) {
      setLimit(10);
    }
  }, [pageParam, limitParam, setPage, setLimit]);

  const { data: adminsData, isLoading } = useAdmins({
    page,
    limit,
    search: search || undefined,
    is_active: (isActive || undefined) as "true" | "false" | undefined,
    sort_by: (sortBy || "created_at") as "created_at" | "name",
    sort_order: (sortOrder || "desc") as "asc" | "desc",
  });

  const admins = adminsData?.data ?? [];
  const meta = adminsData?.meta;

  const allFilterValues = [search, isActive];
  const hasFilters = allFilterValues.some(Boolean);
  const activeFilterCount = allFilterValues.filter(Boolean).length;

  const handleAdd = useCallback(() => {
    setFormModalOpen(true);
  }, []);

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
      setIsActive(value === "all" ? null : value);
      setPage(1);
    },
    [setIsActive, setPage],
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
    setIsActive(null);
    setSortBy("created_at");
    setSortOrder("desc");
    setPage(1);
  }, [setSearch, setIsActive, setSortBy, setSortOrder, setPage]);

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

  const handleResetPassword = useCallback((admin: AdminUser) => {
    setSelectedAdmin(admin);
    setResetPasswordDialogOpen(true);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admins</h1>
          <p className="text-sm text-muted-foreground">
            Manage admin accounts and access status.
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus />
          Add Admin
        </Button>
      </div>

      <div className="rounded-lg border bg-card p-3 shadow-sm sm:p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <form onSubmit={handleSearch} className="relative flex-1 bg-background">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search by name or email..."
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

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-2">
            <Select value={isActive || "all"} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full sm:w-36 bg-background">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy || "created_at"} onValueChange={handleSortByChange}>
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

      {isLoading ? (
        <AdminTableSkeleton />
      ) : admins.length === 0 && !hasFilters ? (
        <AdminEmptyState onAddAdmin={handleAdd} />
      ) : (
        <AdminTable
          key={`table-limit-${limit}`}
          admins={admins}
          pageCount={meta?.total_pages ?? 0}
          pageIndex={(meta?.page ?? 1) - 1}
          pageSize={limit}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onResetPassword={handleResetPassword}
        />
      )}

      <AdminFormModal open={formModalOpen} onOpenChange={setFormModalOpen} />

      <ResetAdminPasswordDialog
        open={resetPasswordDialogOpen}
        onOpenChange={setResetPasswordDialogOpen}
        admin={selectedAdmin}
      />
    </div>
  );
}

export default function AdminsPage() {
  return (
    <Suspense fallback={<AdminTableSkeleton />}>
      <AdminsPageContent />
    </Suspense>
  );
}
