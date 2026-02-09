"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function BannerTableSkeleton() {
  return (
    <div className="rounded-lg border">
      <Table className="min-w-[640px] table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-10" />
            <TableHead className="w-[200px]">Image</TableHead>
            <TableHead className="w-[100px] text-center">Order</TableHead>
            <TableHead className="w-[130px] text-center">Active</TableHead>
            <TableHead className="w-12 text-right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 3 }).map((_, index) => (
            <TableRow key={index}>
              {/* Drag Handle */}
              <TableCell>
                <Skeleton className="h-4 w-4" />
              </TableCell>

              {/* Image */}
              <TableCell>
                <Skeleton className="h-16 w-full rounded-md" />
              </TableCell>

              {/* Sort Order */}
              <TableCell className="text-center">
                <div className="flex justify-center">
                  <Skeleton className="h-5 w-8 rounded-full" />
                </div>
              </TableCell>

              {/* Active Status */}
              <TableCell>
                <div className="flex justify-center">
                  <Skeleton className="h-5 w-10 rounded-full" />
                </div>
              </TableCell>

              {/* Actions */}
              <TableCell className="text-right">
                <Skeleton className="h-8 w-8 ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
