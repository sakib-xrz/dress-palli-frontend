"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Eye, Images, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { useUpdateProductStatus } from "@/hooks/use-products";
import type { AdminProduct } from "@/lib/type";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { TablePagination } from "@/components/shared/table-pagination";

interface ProductTableProps {
  products: AdminProduct[];
  pageCount: number;
  pageIndex: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onDelete: (product: AdminProduct) => void;
  onViewDetails: (product: AdminProduct) => void;
  onManageImages: (product: AdminProduct) => void;
}

export function ProductTable({
  products,
  pageCount,
  pageIndex,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onDelete,
  onViewDetails,
  onManageImages,
}: ProductTableProps) {
  const statusMutation = useUpdateProductStatus();

  const columns = useMemo<ColumnDef<AdminProduct>[]>(
    () => [
      {
        id: "product",
        header: "Product",
        cell: ({ row }) => {
          const product = row.original;
          const image = product.primary_image;
          return (
            <div className="flex items-center gap-3">
              <div className="size-12 shrink-0 overflow-hidden rounded-lg border bg-muted">
                {image ? (
                  <Image
                    src={image.url}
                    alt={image.alt_text || product.name}
                    width={48}
                    height={48}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-[10px] text-muted-foreground">
                    No img
                  </div>
                )}
              </div>
              <div className="min-w-0 space-y-1">
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="font-medium text-sm hover:underline line-clamp-1 block"
                >
                  {product.name}
                </Link>
                <div className="flex flex-wrap items-center gap-1">
                  {product.is_featured && (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 font-normal"
                    >
                      Featured
                    </Badge>
                  )}
                  {product.is_new && (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 font-normal"
                    >
                      New
                    </Badge>
                  )}
                  {product.is_best_selling && (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 font-normal"
                    >
                      Best Selling
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          );
        },
        size: 280,
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
          <Badge variant="outline" className="font-normal">
            {row.original.category?.name ?? "—"}
          </Badge>
        ),
        size: 130,
      },
      {
        id: "price",
        header: () => (
          <div className="flex items-center justify-center">
            Price (<span className="text-red-600 dark:text-red-400">Buy</span>,{" "}
            <span className="text-orange-600 dark:text-orange-400">Cost</span>,{" "}
            <span className="text-blue-600 dark:text-blue-400">Sell</span>)
          </div>
        ),
        cell: ({ row }) => {
          const product = row.original;
          const hasDiscount = product.discount > 0;
          const discountText =
            product.discount_type === "PERCENTAGE"
              ? `${product.discount}% OFF`
              : `${product.discount} BDT OFF`;
          return (
            <div className="space-y-1 text-xs text-center">
              <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 tabular-nums justify-center font-bold">
                <span className="text-red-600 dark:text-red-400">
                  {product.buy_price.toLocaleString("en-BD")}
                </span>
                <span className="text-orange-600 dark:text-orange-400">
                  {product.cost_price.toLocaleString("en-BD")}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-muted-foreground line-through">
                      {product.sell_price.toLocaleString("en-BD")}
                    </span>
                  </>
                )}
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {product.effective_price.toLocaleString("en-BD")}
                </span>
              </div>
              {hasDiscount && (
                <span className="text-green-600 dark:text-green-400 font-medium">
                  {discountText}
                </span>
              )}
            </div>
          );
        },
        size: 200,
      },
      {
        id: "stock",
        header: () => (
          <div className="flex items-center justify-center">Stock</div>
        ),
        cell: ({ row }) => {
          const product = row.original;
          const total = product.total_stock;
          const bySize = product.variants
            .filter((v) => v.size_name)
            .map((v) => `${v.size_name}=${v.stock}`)
            .join(", ");
          return (
            <div className="space-y-0.5 text-center">
              <Badge
                variant={total > 0 ? "secondary" : "destructive"}
                className="font-mono tabular-nums font-medium"
              >
                {total}
              </Badge>
              {product.variants.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  {bySize || "—"}
                </div>
              )}
            </div>
          );
        },
        size: 140,
      },
      {
        accessorKey: "is_published",
        header: () => (
          <div className="flex items-center justify-center">Status</div>
        ),
        cell: ({ row }) => {
          const product = row.original;
          const isLive = product.is_published;
          return (
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center gap-2 rounded-md border px-2 py-1 w-30">
                <Switch
                  size="sm"
                  checked={isLive}
                  onCheckedChange={(checked) => {
                    statusMutation.mutate({
                      id: product.id,
                      data: { is_published: checked },
                    });
                  }}
                  disabled={
                    statusMutation.isPending &&
                    statusMutation.variables?.id === product.id
                  }
                  aria-label={`Toggle ${product.name} status`}
                  className="cursor-pointer"
                />
                <span className="text-xs text-muted-foreground w-16">
                  {isLive ? "Published" : "Unpublished"}
                </span>
              </div>
            </div>
          );
        },
        size: 100,
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const product = row.original;
          return (
            <div className="flex items-center justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-xs">
                    <MoreHorizontal className="size-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => onViewDetails(product)}>
                      <Eye className="size-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Pencil className="size-4" />
                        Edit Product
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onManageImages(product)}>
                      <Images className="size-4" />
                      Manage Images
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => onDelete(product)}
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
        size: 50,
      },
    ],
    [statusMutation, onDelete, onViewDetails, onManageImages],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: products,
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
                      No products found.
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
