"use client";

import { useState, useCallback, useEffect } from "react";
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, X, TrendingUp, Package, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProductSearch, useSingleProductSales } from "@/hooks/use-dashboard";
import type { DatePreset, SingleProductSales } from "@/lib/type";

interface ProductSalesLookupProps {
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

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ProductSalesLookup({
  preset,
  startDate,
  endDate,
}: ProductSalesLookupProps) {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );
  const [selectedProductName, setSelectedProductName] = useState<string>("");
  const [popoverOpen, setPopoverOpen] = useState(false);

  // Debounce search input by 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Search products using the debounced value
  const { data: searchResults, isLoading: isSearching } =
    useProductSearch(debouncedSearch);

  // Get single product sales
  const { data: productSales, isLoading: isLoadingSales } =
    useSingleProductSales(selectedProductId, {
      preset,
      start_date: startDate,
      end_date: endDate,
    });

  const handleSelectProduct = useCallback(
    (productId: string, productName: string) => {
      setSelectedProductId(productId);
      setSelectedProductName(productName);
      setSearchInput("");
      setDebouncedSearch("");
      setPopoverOpen(false);
    },
    [],
  );

  const handleClearSelection = useCallback(() => {
    setSelectedProductId(null);
    setSelectedProductName("");
  }, []);

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Product Sales Lookup</CardTitle>
            <CardDescription>
              Search for a product to view detailed sales analytics
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={popoverOpen}
                  className="w-[300px] justify-start"
                >
                  <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  {selectedProductName || "Search products..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="end">
                <Command shouldFilter={false}>
                  <div className="flex items-center border-b px-3">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <Input
                      placeholder="Type product name..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value.trim())}
                      onInput={(e) =>
                        setSearchInput(
                          (e.target as HTMLInputElement).value.trim(),
                        )
                      }
                      className="flex h-10 w-full border-0 bg-transparent py-2 text-sm focus-visible:outline-none focus-visible:ring-0"
                    />
                  </div>
                  <CommandList>
                    {isSearching && (
                      <div className="p-4 space-y-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Skeleton className="h-8 w-8 rounded" />
                            <Skeleton className="h-4 flex-1" />
                          </div>
                        ))}
                      </div>
                    )}
                    {!isSearching &&
                      debouncedSearch.length >= 2 &&
                      !searchResults?.length && (
                        <CommandEmpty>No products found.</CommandEmpty>
                      )}
                    {searchInput.length < 2 && !isSearching && (
                      <div className="p-4 text-sm text-muted-foreground text-center">
                        Type at least 2 characters to search
                      </div>
                    )}
                    {searchResults && searchResults.length > 0 && (
                      <CommandGroup>
                        {searchResults.map((product) => (
                          <CommandItem
                            key={product.id}
                            value={product.id}
                            onSelect={() =>
                              handleSelectProduct(product.id, product.name)
                            }
                            className="cursor-pointer"
                          >
                            <Avatar className="h-8 w-8 rounded mr-2">
                              <AvatarImage
                                src={product.image || undefined}
                                alt={product.name}
                                className="object-cover"
                              />
                              <AvatarFallback className="rounded text-xs">
                                {product.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate">{product.name}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {selectedProductId && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearSelection}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!selectedProductId && (
          <div className="flex h-[200px] flex-col items-center justify-center text-muted-foreground">
            <Search className="h-10 w-10 mb-2 opacity-50" />
            <p>Search for a product to view sales data</p>
          </div>
        )}

        {selectedProductId && isLoadingSales && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-[250px] rounded-lg" />
          </div>
        )}

        {productSales && <ProductSalesDetails data={productSales} />}
      </CardContent>
    </Card>
  );
}

function ProductSalesDetails({ data }: { data: SingleProductSales }) {
  const chartData = data.trend.map((item) => ({
    date: formatDate(item.date),
    revenue: item.revenue,
    quantity: item.quantity,
  }));

  return (
    <div className="space-y-6">
      {/* Product Info */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 rounded-lg">
          <AvatarImage
            src={data.product.image || undefined}
            alt={data.product.name}
            className="object-cover"
          />
          <AvatarFallback className="rounded-lg text-lg">
            {data.product.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-lg font-semibold">{data.product.name}</h3>
          <p className="text-sm text-muted-foreground">
            Sell: {formatCurrency(data.product.sell_price)} | Buy:{" "}
            {formatCurrency(data.product.buy_price)}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            Total Revenue
          </div>
          <p className="text-2xl font-bold mt-1">
            {formatCurrency(data.summary.total_revenue)}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            Estimated Profit
          </div>
          <p className="text-2xl font-bold mt-1 text-green-600">
            {formatCurrency(data.summary.estimated_profit)}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="h-4 w-4" />
            Units Sold
          </div>
          <p className="text-2xl font-bold mt-1">
            {data.summary.total_quantity_sold}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="h-4 w-4" />
            Current Stock
          </div>
          <p className="text-2xl font-bold mt-1">
            {data.summary.current_stock}
          </p>
        </div>
      </div>

      {/* Sales by Size */}
      {data.variants.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3">Sales by Size</h4>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Size</TableHead>
                  <TableHead className="text-right">Qty Sold</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.variants.map((variant, index) => (
                  <TableRow key={`${index}-${variant.size}`}>
                    <TableCell>
                      <Badge variant="outline">{variant.size}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {variant.quantity_sold}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(variant.revenue)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={
                          variant.current_stock === 0
                            ? "destructive"
                            : variant.current_stock <= 5
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {variant.current_stock}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Sales Trend Chart */}
      {chartData.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3">Daily Sales Trend</h4>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="colorProdRevenue"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-muted"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) =>
                  v >= 1000 ? `BDT ${(v / 1000).toFixed(0)}K` : `BDT ${v}`
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelFormatter={(label) => label}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#colorProdRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
