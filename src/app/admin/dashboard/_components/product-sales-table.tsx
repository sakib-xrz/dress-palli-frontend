"use client";

import { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { Button } from "@/components/ui/button";
import { Search, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useProductSales } from "@/hooks/use-dashboard";
import type { DatePreset, ProductSalesItem } from "@/lib/type";

interface ProductSalesTableProps {
  preset?: DatePreset;
  startDate?: string;
  endDate?: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ProductSalesTable({
  preset,
  startDate,
  endDate,
}: ProductSalesTableProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [sortBy, setSortBy] = useState<"revenue" | "quantity" | "name">(
    "revenue",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Debounce search
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    const timeout = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, []);

  const { data, isLoading } = useProductSales({
    preset,
    start_date: startDate,
    end_date: endDate,
    search: debouncedSearch || undefined,
    page,
    limit,
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  const handleSort = (column: "revenue" | "quantity" | "name") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const totalPages = data?.meta?.total_pages || 1;

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Product Sales Report</CardTitle>
            <CardDescription>
              All products with sales data for the selected period
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-8 w-[200px]"
              />
            </div>
            <Select
              value={sortBy}
              onValueChange={(v) =>
                setSortBy(v as "revenue" | "quantity" | "name")
              }
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="quantity">Quantity</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              title={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : !data?.data?.length ? (
          <div className="flex h-[200px] flex-col items-center justify-center text-muted-foreground">
            <p>No products found</p>
          </div>
        ) : (
          <>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Product</TableHead>
                    <TableHead
                      className="text-right cursor-pointer hover:text-foreground"
                      onClick={() => handleSort("quantity")}
                    >
                      <span className="flex items-center justify-end gap-1">
                        Qty Sold
                        {sortBy === "quantity" && (
                          <ArrowUpDown className="h-3 w-3" />
                        )}
                      </span>
                    </TableHead>
                    <TableHead
                      className="text-right cursor-pointer hover:text-foreground"
                      onClick={() => handleSort("revenue")}
                    >
                      <span className="flex items-center justify-end gap-1">
                        Revenue
                        {sortBy === "revenue" && (
                          <ArrowUpDown className="h-3 w-3" />
                        )}
                      </span>
                    </TableHead>
                    <TableHead className="text-right">Est. Profit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((product: ProductSalesItem) => (
                    <TableRow key={product.product_id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 rounded-lg">
                            <AvatarImage
                              src={product.image || undefined}
                              alt={product.name}
                              className="object-cover"
                            />
                            <AvatarFallback className="rounded-lg">
                              {product.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium truncate max-w-[200px]">
                              {product.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(product.sell_price)}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">
                          {product.quantity_sold}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(product.revenue)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            product.estimated_profit >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {formatCurrency(product.estimated_profit)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages} ({data.meta?.total || 0} products)
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
