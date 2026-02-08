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
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { TablePagination } from "@/components/shared/table-pagination";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
              <div className="size-12 overflow-hidden rounded-md border bg-muted shrink-0">
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
              <div className="min-w-0 space-y-0.5">
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="font-medium text-sm hover:underline line-clamp-1"
                >
                  {product.name}
                </Link>
                <div className="flex items-center gap-1 flex-wrap">
                  {product.is_featured && (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0"
                    >
                      Featured
                    </Badge>
                  )}
                  {product.is_new && (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0"
                    >
                      New
                    </Badge>
                  )}
                  {product.is_best_selling && (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0"
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
        header: "Price",
        cell: ({ row }) => {
          const { min, max } = row.original.price_range;
          return (
            <span className="text-sm font-medium tabular-nums">
              {min === max ? `BDT ${min}` : `BDT ${min} – BDT ${max}`}
            </span>
          );
        },
        size: 140,
      },
      {
        id: "stock",
        header: () => (
          <div className="flex items-center justify-center">Stock</div>
        ),
        cell: ({ row }) => {
          const stock = row.original.total_stock;
          return (
            <div className="flex items-center justify-center">
              <Badge
                variant={stock > 0 ? "outline" : "destructive"}
                className="font-mono text-xs tabular-nums"
              >
                {stock > 0 ? stock : "Out of stock"}
              </Badge>
            </div>
          );
        },
        size: 100,
      },
      {
        id: "colors",
        header: () => (
          <div className="flex items-center justify-center">Colors</div>
        ),
        cell: ({ row }) => {
          const colors = row.original.available_colors;
          if (colors.length === 0)
            return (
              <span className="text-muted-foreground text-xs flex items-center justify-center">
                —
              </span>
            );
          return (
            <TooltipProvider>
              <div className="flex items-center gap-1 justify-center">
                {colors.slice(0, 4).map((c) => (
                  <Tooltip key={c.id}>
                    <TooltipTrigger asChild>
                      <span
                        className="size-5 rounded-full border cursor-default shrink-0"
                        style={{ backgroundColor: c.code ?? "#ccc" }}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{c.name}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
                {colors.length > 4 && (
                  <Badge variant="outline" className="text-[10px] px-1 py-0">
                    +{colors.length - 4}
                  </Badge>
                )}
              </div>
            </TooltipProvider>
          );
        },
        size: 120,
      },
      {
        id: "sizes",
        header: () => (
          <div className="flex items-center justify-center">Sizes</div>
        ),
        cell: ({ row }) => {
          const sizes = row.original.available_sizes;
          if (sizes.length === 0)
            return (
              <span className="text-muted-foreground text-xs flex items-center justify-center">
                —
              </span>
            );
          return (
            <div className="flex items-center gap-1 flex-wrap justify-center">
              {sizes.slice(0, 3).map((s) => (
                <Badge
                  key={s.id}
                  variant="outline"
                  className="text-[10px] px-1.5 py-0"
                >
                  {s.name}
                </Badge>
              ))}
              {sizes.length > 3 && (
                <Badge variant="outline" className="text-[10px] px-1 py-0">
                  +{sizes.length - 3}
                </Badge>
              )}
            </div>
          );
        },
        size: 130,
      },
      {
        accessorKey: "is_published",
        header: () => (
          <div className="flex items-center justify-center">Status</div>
        ),
        cell: ({ row }) => {
          const product = row.original;
          return (
            <div className="flex items-center gap-2 justify-center">
              <Switch
                size="sm"
                checked={product.is_published}
                onCheckedChange={(checked) => {
                  statusMutation.mutate({
                    id: product.id,
                    data: { is_published: checked },
                  });
                }}
                disabled={statusMutation.isPending}
                aria-label={`Toggle ${product.name} status`}
                className="cursor-pointer"
              />
              <span className="text-xs text-muted-foreground">
                {product.is_published ? "Live" : "Draft"}
              </span>
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
                    <MoreHorizontal />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onViewDetails(product)}>
                    <Eye />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/products/${product.id}/edit`}>
                      <Pencil />
                      Edit Product
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onManageImages(product)}>
                    <Images />
                    Manage Images
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => onDelete(product)}
                  >
                    <Trash2 />
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
      const newState =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
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
      <div className="rounded-lg border overflow-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.getSize() }}
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
                  data-state={row.getIsSelected() && "selected"}
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
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <TablePagination table={table} />
    </div>
  );
}
