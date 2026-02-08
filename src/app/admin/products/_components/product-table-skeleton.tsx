"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ProductTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Toolbar skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-9 w-28" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-lg border">
        {/* Header */}
        <div className="flex items-center gap-4 border-b px-4 py-3">
          <Skeleton className="size-4" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-8" />
        </div>

        {/* Rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b px-4 py-3 last:border-0"
          >
            <Skeleton className="size-4" />
            <Skeleton className="size-10 rounded" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="size-8" />
          </div>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between px-4">
        <Skeleton className="h-4 w-40" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-4 w-24" />
          <div className="flex gap-2">
            <Skeleton className="size-8" />
            <Skeleton className="size-8" />
            <Skeleton className="size-8" />
            <Skeleton className="size-8" />
          </div>
        </div>
      </div>
    </div>
  );
}
