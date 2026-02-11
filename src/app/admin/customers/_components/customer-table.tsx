"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Phone } from "lucide-react";

import type { Customer } from "@/lib/type";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TablePagination } from "@/components/shared/table-pagination";

interface CustomerTableProps {
  customers: Customer[];
  pageCount: number;
  pageIndex: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function CustomerTable({
  customers,
  pageCount,
  pageIndex,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: CustomerTableProps) {
  const columns = useMemo<ColumnDef<Customer>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Customer",
        cell: ({ row }) => {
          const customer = row.original;
          return (
            <div className="min-w-0 space-y-1">
              <div className="font-medium text-sm line-clamp-1">
                {customer.name}
              </div>
              {customer.email && (
                <div className="text-xs text-muted-foreground line-clamp-1">
                  {customer.email}
                </div>
              )}
            </div>
          );
        },
        size: 200,
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => {
          const customer = row.original;
          return (
            <a
              href={`tel:${customer.phone}`}
              className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 text-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <Phone className="size-3" />
              {customer.phone}
            </a>
          );
        },
        size: 150,
      },
      {
        id: "orders",
        header: () => (
          <div className="flex items-center justify-center">Orders</div>
        ),
        cell: ({ row }) => {
          const customer = row.original;
          const count = customer._count?.orders ?? 0;
          return (
            <div className="flex items-center justify-center">
              <span className="text-sm font-medium tabular-nums">{count}</span>
            </div>
          );
        },
        size: 100,
      },
      {
        accessorKey: "created_at",
        header: "Joined",
        cell: ({ row }) => {
          const customer = row.original;
          return (
            <div className="text-sm text-muted-foreground">
              {new Date(customer.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </div>
          );
        },
        size: 140,
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const customer = row.original;
          return (
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/customers/${customer.id}`}>View</Link>
              </Button>
            </div>
          );
        },
        size: 50,
      },
    ],
    [],
  );

  const table = useReactTable({
    data: customers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
    state: {
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    onPaginationChange: (updater) => {
      const currentState = { pageIndex, pageSize };
      const newState =
        typeof updater === "function" ? updater(currentState) : updater;

      if (newState.pageIndex !== pageIndex) {
        onPageChange(newState.pageIndex);
      }
      if (newState.pageSize !== pageSize) {
        onPageSizeChange(newState.pageSize);
      }
    },
  });

  return (
    <div className="space-y-4">
      <Card className="py-0">
        <CardContent className="p-0">
          <div className="overflow-auto rounded-b-xl">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="hover:bg-transparent"
                  >
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        style={{ width: header.getSize() }}
                        className="bg-muted/50 sticky top-0 z-10 font-semibold"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() ? "selected" : undefined}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="hover:bg-transparent">
                    <TableCell
                      colSpan={columns.length}
                      className="h-32 text-center text-muted-foreground"
                    >
                      No customers found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <TablePagination table={table} />
    </div>
  );
}
