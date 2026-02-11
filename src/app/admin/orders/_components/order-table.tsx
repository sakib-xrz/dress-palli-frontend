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

import {
  useUpdateOrderStatus,
  useUpdatePaymentStatus,
} from "@/hooks/use-orders";
import type { Order, OrderStatus, PaymentStatus } from "@/lib/type";

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
}

export function OrderTable({
  orders,
  pageCount,
  pageIndex,
  pageSize,
  onPageChange,
  onPageSizeChange,
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
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${order.customer_phone}`}
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Phone className="size-3" />
                  {order.customer_phone}
                </a>
              </div>
            </div>
          );
        },
        size: 180,
      },
      {
        id: "shipping_address",
        header: "Delivery Address",
        cell: ({ row }) => {
          const order = row.original;
          const address = order.shipping_address;
          return (
            <div className="min-w-0 space-y-1">
              <div className="text-sm line-clamp-1">{address.address}</div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {address.area && <span>{address.area}</span>}
                {address.area && address.city && <span>•</span>}
                {address.city && <span>{address.city}</span>}
              </div>
            </div>
          );
        },
        size: 220,
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
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/orders/${order.id}`}>View</Link>
              </Button>
            </div>
          );
        },
        size: 50,
      },
    ],
    [orderStatusMutation, paymentStatusMutation],
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
