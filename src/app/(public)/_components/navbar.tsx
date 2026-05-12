"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  IconBuildingStore,
  IconChevronDown,
  IconHome2,
  IconMenu2,
  IconPackage,
  IconSearch,
  IconShoppingCart,
} from "@tabler/icons-react";
import { useGlobalSettings } from "@/contexts/settings-context";
import api from "@/lib/axios";
import type { ApiResponse, Category } from "@/lib/type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { useCartCount } from "@/store/use-cart-store";

const searchSuggestions = ["Saree", "Three Piece"];
const MIN_SEARCH_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 400;

type GlobalSearchProduct = {
  id: string;
  name: string;
  slug: string;
  sell_price: number;
  discount: number;
  discount_type: "PERCENTAGE" | "FLAT" | "FIXED";
  effective_price: number;
  image: {
    url: string;
    alt: string;
  } | null;
};

type NavbarProps = {
  categories: Category[];
};

type CategoryTreeNode = {
  id: string;
  name: string;
  slug: string;
  children?: CategoryTreeNode[];
};

export default function Navbar({ categories }: NavbarProps) {
  const { settings } = useGlobalSettings();
  const brandName = settings?.title ?? "Dress Point";
  const logo = settings?.logo ?? "/logo.png";
  const cartCount = useCartCount();
  const categoryTree = categories as CategoryTreeNode[];
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<GlobalSearchProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const trimmedSearchTerm = searchTerm.trim();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    if (!debouncedSearchTerm) {
      setSearchResults([]);
      setSearchError(null);
      setIsSearching(false);
      return;
    }

    if (debouncedSearchTerm.length < MIN_SEARCH_LENGTH) {
      setSearchResults([]);
      setSearchError(null);
      setIsSearching(false);
      return;
    }

    const currentRequestId = ++requestIdRef.current;

    const fetchSearchResults = async () => {
      try {
        setIsSearching(true);
        setSearchError(null);

        const response: ApiResponse<GlobalSearchProduct[]> = await api.get(
          "/products/search",
          {
            params: { search: debouncedSearchTerm },
          },
        );

        if (currentRequestId !== requestIdRef.current) return;
        setSearchResults(response.data ?? []);
      } catch (error) {
        if (currentRequestId !== requestIdRef.current) return;
        setSearchResults([]);
        setSearchError(
          error && typeof error === "object" && "message" in error
            ? String(error.message)
            : "Failed to search products. Please try again.",
        );
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setIsSearching(false);
        }
      }
    };

    fetchSearchResults();
  }, [debouncedSearchTerm]);

  const renderCategoryNodes = (
    nodes: CategoryTreeNode[],
    parentSlugs: string[] = [],
    depth = 0,
  ) => {
    return nodes.map((node) => {
      const currentSlugs = [...parentSlugs, node.slug];
      const href = `/category/${currentSlugs.join("/")}`;
      const childNodes = node.children ?? [];
      const hasChildren = childNodes.length > 0;

      if (!hasChildren) {
        return (
          <SheetClose asChild key={node.id}>
            <Link
              href={href}
                className="grid min-h-9 items-center rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-all duration-200 hover:bg-muted hover:text-accent"
              style={{ paddingInlineStart: `${depth * 12 + 12}px` }}
            >
              {node.name}
            </Link>
          </SheetClose>
        );
      }

      return (
        <Collapsible key={node.id} className="grid gap-1">
          <div
            className="grid grid-cols-[1fr_auto] items-center gap-1"
            style={{ paddingInlineStart: `${depth * 12}px` }}
          >
            <SheetClose asChild>
              <Link
                href={href}
                className="grid min-h-9 items-center rounded-lg px-3 py-2 text-sm font-semibold text-foreground transition-all duration-200 hover:bg-muted hover:text-accent"
              >
                {node.name}
              </Link>
            </SheetClose>

            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-8 transition-all duration-200 hover:bg-muted [&[data-state=open]>svg]:rotate-180"
                aria-label={`Toggle ${node.name} subcategories`}
              >
                <IconChevronDown className="size-4 transition-transform duration-300" />
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent className="ml-3 grid gap-1 border-l-2 border-border">
            {renderCategoryNodes(childNodes, currentSlugs, depth + 1)}
          </CollapsibleContent>
        </Collapsible>
      );
    });
  };

  return (
    <header className="sticky top-0 z-50">
      <div className="border-b border-border/80 bg-background/95 backdrop-blur">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3 md:gap-4 lg:h-20">
          <div className="grid grid-flow-col auto-cols-max items-center justify-self-start gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="grid rounded-xl border-border/80 bg-card shadow-xs hover:bg-muted"
                  aria-label="Open menu"
                >
                  <IconMenu2 className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                  className="grid w-[85vw] grid-rows-[auto_1fr] gap-0 p-0 sm:w-[400px]"
              >
                <SheetHeader className="border-border border-b px-5 py-4.5 lg:py-5">
                  <SheetTitle className="grid grid-cols-[auto_1fr] items-center gap-3">
                    {logo ? (
                      <Image
                        src={logo}
                        alt={brandName}
                        width={48}
                        height={48}
                        className="aspect-square lg:size-10 size-8 object-contain rounded-lg"
                      />
                    ) : (
                      <div className="grid size-8 place-items-center rounded-lg bg-linear-to-br from-primary to-accent text-base font-bold text-primary-foreground shadow-md lg:size-10">
                        {brandName.charAt(0)}
                      </div>
                    )}
                    <span className="bg-linear-to-r from-accent to-primary bg-clip-text text-lg font-bold text-transparent lg:text-xl">
                      {brandName}
                    </span>
                  </SheetTitle>
                </SheetHeader>

                <div className="grid content-start gap-4 overflow-y-auto px-4 py-4">
                  <div>
                    <SheetClose asChild>
                      <Link
                        href="/"
                        className="grid min-h-10 grid-cols-[auto_1fr] items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-foreground transition-all duration-200 hover:bg-muted hover:text-accent hover:shadow-sm"
                      >
                        <IconHome2 className="size-5" />
                        <span>Home</span>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/products"
                        className="grid min-h-10 grid-cols-[auto_1fr] items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-foreground transition-all duration-200 hover:bg-muted hover:text-accent hover:shadow-sm"
                      >
                        <IconBuildingStore className="size-5" />
                        <span>Shop</span>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/track-order"
                        className="grid min-h-10 grid-cols-[auto_1fr] items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-foreground transition-all duration-200 hover:bg-muted hover:text-accent hover:shadow-sm"
                      >
                        <IconPackage className="size-5" />
                        <span>Track Order</span>
                      </Link>
                    </SheetClose>
                  </div>

                  <Separator className="my-1" />

                  <div className="space-y-2">
                    <p className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Shop by Category
                    </p>
                    <nav
                      className="grid gap-2 rounded-xl border border-border/80 bg-linear-to-br from-card/90 to-muted/80 p-3"
                      aria-label="Category menu"
                    >
                      {renderCategoryNodes(categoryTree)}

                      {categories.length === 0 && (
                        <p className="text-muted-foreground px-3 py-2 text-sm italic">
                          Categories are not available right now.
                        </p>
                      )}
                    </nav>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <Link
            href="/"
            className="group grid auto-cols-max grid-flow-col items-center justify-self-center gap-2 text-foreground"
          >
            {logo ? (
              <div className="relative">
                <Image
                  src={logo}
                  alt={brandName}
                  width={100}
                  height={100}
                  className="relative aspect-square lg:size-12 size-10 object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ) : (
              <div className="grid items-center gap-1">
                <div className="grid size-10 place-items-center rounded-xl bg-linear-to-br from-primary to-accent text-lg font-bold text-primary-foreground shadow-lg transition-transform duration-300 group-hover:scale-105 lg:size-12 lg:text-xl">
                  {brandName.charAt(0)}
                </div>
                <p className="hidden bg-linear-to-r from-accent to-primary bg-clip-text text-center text-xs font-semibold text-transparent lg:block">
                  Fashion
                </p>
              </div>
            )}
          </Link>

          <div className="grid grid-flow-col auto-cols-max items-center justify-self-end gap-1.5 md:gap-2">
            <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative rounded-full transition-colors duration-200 hover:bg-muted"
                  aria-label="Open global search"
                >
                  <IconSearch className="size-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-screen border-border/80 bg-card p-4 shadow-xl sm:w-96"
                sideOffset={12}
                side="bottom"
              >
                <div className="grid gap-4">
                  <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                    <div className="rounded-lg bg-linear-to-br from-muted to-card p-2">
                      <IconSearch className="size-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Global Search</p>
                      <p className="text-muted-foreground text-xs">
                        Search products, categories & more
                      </p>
                    </div>
                  </div>
                  <Input
                    placeholder="Search for dresses, sarees..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="h-11 border-border/80 bg-background focus-visible:ring-ring"
                    autoFocus
                  />
                  {!trimmedSearchTerm && (
                    <div className="grid gap-2">
                      <p className="text-muted-foreground text-xs font-medium">
                        Popular Searches:
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {searchSuggestions.map((item) => (
                          <Button
                            key={item}
                            variant="secondary"
                            size="sm"
                            className="justify-start hover:bg-muted"
                            onClick={() => setSearchTerm(item)}
                          >
                            {item}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {!!trimmedSearchTerm &&
                    trimmedSearchTerm.length < MIN_SEARCH_LENGTH && (
                      <p className="text-muted-foreground text-xs">
                        Type at least {MIN_SEARCH_LENGTH} characters to search.
                      </p>
                    )}

                  {!!trimmedSearchTerm &&
                    trimmedSearchTerm.length >= MIN_SEARCH_LENGTH && (
                      <div className="grid gap-2">
                        <p className="text-muted-foreground text-xs font-medium">
                          Search Results
                        </p>

                        {isSearching && (
                          <div className="grid gap-2">
                            {[...Array(4)].map((_, index) => (
                              <div
                                key={`search-skeleton-${index}`}
                                className="border-border grid grid-cols-[44px_1fr] items-center gap-3 rounded-md border p-2"
                              >
                                <Skeleton className="h-11 w-11 rounded-md" />
                                <div className="grid gap-2">
                                  <Skeleton className="h-3.5 w-4/5" />
                                  <Skeleton className="h-3 w-2/5" />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {!isSearching && searchError && (
                          <p className="text-destructive text-xs">
                            {searchError}
                          </p>
                        )}

                        {!isSearching &&
                          !searchError &&
                          searchResults.length === 0 && (
                            <p className="text-muted-foreground text-xs">
                              No products found for &quot;{trimmedSearchTerm}
                              &quot;.
                            </p>
                          )}

                        {!isSearching &&
                          !searchError &&
                          searchResults.length > 0 && (
                            <div className="grid max-h-72 gap-2 overflow-y-auto pr-1">
                              {searchResults.map((product) => (
                                <Link
                                  key={product.id}
                                  href={`/products/${product.slug}`}
                                  onClick={() => {
                                    setIsSearchOpen(false);
                                    setSearchTerm("");
                                    setSearchResults([]);
                                    setSearchError(null);
                                    setIsSearching(false);
                                  }}
                                  className="hover:bg-muted/70 grid grid-cols-[44px_1fr_auto] items-center gap-3 rounded-md px-2 py-2 transition-colors"
                                >
                                  {product.image ? (
                                    <Image
                                      src={product.image.url}
                                      alt={product.name}
                                      width={44}
                                      height={44}
                                      className="h-11 w-11 rounded-md object-cover"
                                    />
                                  ) : (
                                    <div className="bg-muted text-muted-foreground grid h-11 w-11 place-items-center rounded-md text-sm font-semibold">
                                      {product.name.charAt(0)}
                                    </div>
                                  )}
                                  <div className="grid min-w-0 gap-1">
                                    <p className="truncate text-sm font-medium">
                                      {product.name}
                                    </p>
                                    <p className="text-muted-foreground text-xs">
                                      BDT{" "}
                                      {product.effective_price.toLocaleString(
                                        "en-BD",
                                      )}
                                    </p>
                                  </div>
                                  {product.discount > 0 && (
                                    <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-accent">
                                      {product.discount}
                                      {product.discount_type === "PERCENTAGE"
                                        ? "%"
                                        : " BDT"}{" "}
                                      OFF
                                    </span>
                                  )}
                                </Link>
                              ))}
                            </div>
                          )}
                      </div>
                    )}
                </div>
              </PopoverContent>
            </Popover>

            <Button
              asChild
              variant="ghost"
              size="icon"
              className="relative rounded-full transition-colors duration-200 hover:bg-muted"
              aria-label="View shopping cart"
            >
              <Link href="/cart">
                <IconShoppingCart className="size-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full border-0 bg-linear-to-r from-primary to-accent px-1 text-[10px] font-bold text-primary-foreground shadow-md">
                    {cartCount}
                  </Badge>
                )}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
