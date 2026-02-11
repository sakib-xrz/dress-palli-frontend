"use client";

import { useParams } from "next/navigation";
import { useCustomer } from "@/hooks/use-customers";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Mail,
  Phone,
  ShoppingBag,
  User,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

// ── Helpers ──────────────────────────────────────────────

function formatCurrency(value: number) {
  return `BDT ${value.toLocaleString("en-BD")}`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Loading Skeleton ─────────────────────────────────────

function CustomerDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-6 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────

export default function CustomerDetailPage() {
  const params = useParams();
  const customerId = params.id as string;

  const { data: customer, isLoading } = useCustomer(customerId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CustomerDetailSkeleton />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <User className="size-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Customer not found</h2>
        <p className="text-muted-foreground mb-6">
          The customer you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button asChild>
          <Link href="/admin/customers">
            <ArrowLeft className="size-4" />
            Back to Customers
          </Link>
        </Button>
      </div>
    );
  }

  const orders = (customer as { orders?: Array<{
    id: string;
    order_id: string;
    status: string;
    payment_status: string;
    total_amount: number;
    created_at: string;
  }> }).orders ?? [];
  const orderCount = customer._count?.orders ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/customers">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {customer.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="size-4" />
                <span>Joined {formatDate(customer.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                <User className="size-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-sm font-medium">Name</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{customer.name}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                <Phone className="size-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-sm font-medium">Phone</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="font-mono">{customer.phone}</p>
              <Button variant="outline" size="sm" asChild>
                <a href={`tel:${customer.phone}`}>
                  <Phone className="size-3.5" />
                  Call
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                <Mail className="size-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-sm font-medium">Email</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{customer.email || "—"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
              <ShoppingBag className="size-4 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-base">Order History</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {orderCount} order{orderCount !== 1 ? "s" : ""} total
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No orders yet. Orders will appear here when the customer places
              them.
            </p>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table className="bg-background">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold">Order ID</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Payment</TableHead>
                    <TableHead className="font-semibold text-right">
                      Total
                    </TableHead>
                    <TableHead className="font-semibold w-[80px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">
                        {order.order_id}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(order.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {order.payment_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatCurrency(Number(order.total_amount))}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/orders/${order.id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
