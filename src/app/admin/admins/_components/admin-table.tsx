"use client";

import { useMemo } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { KeyRound, MoreHorizontal } from "lucide-react";

import { useUpdateAdminStatus } from "@/hooks/use-admins";
import type { AdminUser } from "@/lib/type";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminTableProps {
  admins: AdminUser[];
  pageCount: number;
  pageIndex: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onResetPassword: (admin: AdminUser) => void;
}

export function AdminTable({
  admins,
  pageCount,
  pageIndex,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onResetPassword,
}: AdminTableProps) {
  const updateStatusMutation = useUpdateAdminStatus();

  const columns = useMemo<ColumnDef<AdminUser>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Admin",
        cell: ({ row }) => {
          const admin = row.original;
          return (
            <div className="min-w-0 space-y-1">
              <div className="font-medium text-sm line-clamp-1">{admin.name}</div>
              <div className="text-xs text-muted-foreground line-clamp-1">
                {admin.email}
              </div>
            </div>
          );
        },
        size: 280,
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
          const admin = row.original;
          return (
            <Badge variant={admin.role === "SUPER_ADMIN" ? "default" : "outline"}>
              {admin.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
            </Badge>
          );
        },
        size: 140,
      },
      {
        id: "is_active",
        header: "Status",
        cell: ({ row }) => {
          const admin = row.original;
          return (
            <div className="flex items-center gap-2 rounded-md border px-2 py-1 w-32">
              <Switch
                size="sm"
                checked={admin.is_active}
                disabled={updateStatusMutation.isPending}
                onCheckedChange={(checked) => {
                  updateStatusMutation.mutate({
                    id: admin.id,
                    data: { is_active: checked },
                  });
                }}
                aria-label={`Toggle ${admin.name} status`}
                className="cursor-pointer"
              />
              <span className="text-xs text-muted-foreground w-16">
                {admin.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          );
        },
        size: 160,
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => {
          const admin = row.original;
          return (
            <div className="text-sm text-muted-foreground">
              {new Date(admin.created_at).toLocaleDateString("en-US", {
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
          const admin = row.original;
          return (
            <div className="flex items-center justify-end gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-xs">
                    <MoreHorizontal className="size-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onResetPassword(admin)}>
                    <KeyRound className="size-4" />
                    Reset Password
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
        size: 60,
      },
    ],
    [onResetPassword, updateStatusMutation],
  );

  const table = useReactTable({
    data: admins,
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
                      No admins found.
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
