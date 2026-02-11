"use client";

import { useMemo } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Eye, MoreHorizontal, Trash2 } from "lucide-react";

import {
  useUpdateOrderStatus,
  useUpdatePaymentStatus,
} from "@/hooks/use-orders";
import type { Order, OrderStatus, PaymentStatus } from "@/lib/type";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TablePagination } from "@/components/shared/table-pagination";

interface OrderTableProps {
  orders: Order[];
  pageCount: number;
  pageIndex: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onDelete: (order: Order) => void;
  onViewDetails: (order: Order) => void;
}

const ORDER_STATUS_COLORS: Record<
  OrderStatus,
  { variant: "default" | "secondary" | "destructive" | "outline"; className?: string }
> = {
  PENDING: { variant: "secondary" },
  CONFIRMED: { variant: "default", className: "bg-blue-600 hover:bg-blue-700" },
  PROCESSING: { variant: "default", className: "bg-purple-600 hover:bg-purple-700" },
  SHIPPED: { variant: "default", className: "bg-indigo-600 hover:bg-indigo-700" },
  DELIVERED: { variant: "default", className: "bg-green-600 hover:bg-green-700" },
  CANCELLED: { variant: "destructive" },
  RETURNED: { variant: "outline", className: "border-amber-600 text-amber-600" },
};

const PAYMENT_STATUS_COLORS: Record<
  PaymentStatus,
  { variant: "default" | "secondary" | "destructive"; className?: string }
> = {
  PENDING: { variant: "secondary" },
  COLLECTED: { variant: "default", className: "bg-green-600 hover:bg-green-700" },
  REFUNDED: { variant: "destructive" },
};

export function OrderTable({
  orders,
  pageCount,
  pageIndex,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onDelete,
  onViewDetails,
}: OrderTableProps) {
  const orderStatusMutation = useUpdateOrderStatus();
  const paymentStatusMutation = useUpdatePaymentStatus();

  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        accessorKey: "order_id",
        header: "Order ID",
        cell: ({ row }) => {
          const order = row.original;
          return (
            <div className="min-w-0 space-y-1">
              <div className="font-mono text-sm font-medium">
                {order.order_id}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(order.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          );
        },
        size: 150,
      },
      {
        accessorKey: "customer",
        header: "Customer",
        cell: ({ row }) => {
          const order = row.original;
          return (
            <div className="min-w-0 space-y-1">
              <div className="font-medium text-sm line-clamp-1">
                {order.customer_name}
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                {order.customer_phone}
              </div>
            </div>
          );
        },
        size: 180,
      },
      {
        id: "items",
        header: () => (
          <div className="flex items-center justify-center">Items</div>
        ),
        cell: ({ row }) => {
          const order = row.original;
          const itemCount = order._count?.items ?? 0;
          return (
            <div className="text-center">
              <Badge variant="secondary" className="font-mono tabular-nums">
                {itemCount}
              </Badge>
            </div>
          );
        },
        size: 80,
      },
      {
        id: "amount",
        header: () => (
          <div className="flex items-center justify-end">Amount</div>
        ),
        cell: ({ row }) => {
          const order = row.original;
          return (
            <div className="space-y-1 text-right">
              <div className="font-semibold text-sm tabular-nums">
                BDT {order.total_amount.toLocaleString("en-BD")}
              </div>
              <div className="text-xs text-muted-foreground">
                Subtotal: {order.subtotal_amount.toLocaleString("en-BD")} + 
                Delivery: {order.delivery_fee.toLocaleString("en-BD")}
              </div>
            </div>
          );
        },
        size: 180,
      },
      {
        accessorKey: "status",
        header: () => (
          <div className="flex items-center justify-center">Order Status</div>
        ),
        cell: ({ row }) => {
          const order = row.original;
          const statusConfig = ORDER_STATUS_COLORS[order.status];
          return (
            <div className="flex items-center justify-center">
              <Select
                value={order.status}
                onValueChange={(value: OrderStatus) => {
                  orderStatusMutation.mutate({
                    id: order.id,
                    data: { status: value },
                  });
                }}
                disabled={
                  orderStatusMutation.isPending &&
                  orderStatusMutation.variables?.id === order.id
                }
              >
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="SHIPPED">Shipped</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="RETURNED">Returned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          );
        },
        size: 140,
      },
      {
        accessorKey: "payment_status",
        header: () => (
          <div className="flex items-center justify-center">Payment</div>
        ),
        cell: ({ row }) => {
          const order = row.original;
          const statusConfig = PAYMENT_STATUS_COLORS[order.payment_status];
          return (
            <div className="flex items-center justify-center">
              <Select
                value={order.payment_status}
                onValueChange={(value: PaymentStatus) => {
                  paymentStatusMutation.mutate({
                    id: order.id,
                    data: { payment_status: value },
                  });
                }}
                disabled={
                  paymentStatusMutation.isPending &&
                  paymentStatusMutation.variables?.id === order.id
                }
              >
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="COLLECTED">Collected</SelectItem>
                  <SelectItem value="REFUNDED">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          );
        },
        size: 140,
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const order = row.original;
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
                    <DropdownMenuItem onClick={() => onViewDetails(order)}>
                      <Eye className="size-4" />
                      View Details
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  {order.status === "PENDING" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => onDelete(order)}
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
        size: 50,
      },
    ],
    [orderStatusMutation, paymentStatusMutation, onDelete, onViewDetails],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: orders,
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
                      No orders found.
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
