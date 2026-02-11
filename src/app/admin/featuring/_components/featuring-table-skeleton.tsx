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

export function FeaturingTableSkeleton() {
  return (
    <div className="rounded-lg border">
      <Table className="min-w-[640px] table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-10" />
            <TableHead className="w-[200px]">Image</TableHead>
            <TableHead className="w-[160px]">Category</TableHead>
            <TableHead className="w-[100px] text-center">Order</TableHead>
            <TableHead className="w-[130px] text-center">Published</TableHead>
            <TableHead className="w-12 text-right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="h-4 w-4" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-[90px] w-[160px] rounded-md aspect-21/8" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center">
                  <Skeleton className="h-5 w-5 rounded-full" />
                </div>
              </TableCell>
              <TableCell>
                <div className="flex justify-center">
                  <Skeleton className="h-5 w-10 rounded-full" />
                </div>
              </TableCell>
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
