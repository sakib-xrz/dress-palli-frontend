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
  const brandName = settings?.title ?? "Dress Palli";
  const logo = settings?.logo ?? "";
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
              className="text-foreground hover:bg-linear-to-r hover:from-pink-100 hover:to-purple-100 dark:hover:from-pink-900/20 dark:hover:to-purple-900/20 grid min-h-9 items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-200"
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
                className="text-foreground hover:bg-linear-to-r hover:from-pink-100 hover:to-purple-100 dark:hover:from-pink-900/20 dark:hover:to-purple-900/20 grid min-h-9 items-center rounded-md px-3 py-2 text-sm font-semibold transition-all duration-200"
              >
                {node.name}
              </Link>
            </SheetClose>

            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-8 hover:bg-pink-100 dark:hover:bg-pink-900/20 [&[data-state=open]>svg]:rotate-180 transition-all duration-200"
                aria-label={`Toggle ${node.name} subcategories`}
              >
                <IconChevronDown className="size-4 transition-transform duration-300" />
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent className="border-pink-200 dark:border-pink-800 ml-3 grid gap-1 border-l-2">
            {renderCategoryNodes(childNodes, currentSlugs, depth + 1)}
          </CollapsibleContent>
        </Collapsible>
      );
    });
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Main Navbar */}
      <div className="border-border border-b bg-white">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3.5 md:gap-4 lg:h-[5rem]">
          <div className="grid grid-flow-col auto-cols-max items-center justify-self-start gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="grid shadow-xs"
                  aria-label="Open menu"
                >
                  <IconMenu2 className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="grid grid-rows-[auto_1fr] gap-0 p-0 w-[85vw] sm:w-[400px]"
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
                      <div className="bg-linear-to-br from-pink-500 to-purple-500 text-white grid lg:size-10 size-8 place-items-center rounded-lg text-base font-bold shadow-md">
                        {brandName.charAt(0)}
                      </div>
                    )}
                    <span className="text-lg lg:text-xl font-bold bg-linear-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                      {brandName}
                    </span>
                  </SheetTitle>
                </SheetHeader>

                <div className="grid content-start gap-4 overflow-y-auto px-4 py-4">
                  <div>
                    <SheetClose asChild>
                      <Link
                        href="/"
                        className="text-foreground hover:bg-linear-to-r hover:from-pink-100 hover:to-purple-100 dark:hover:from-pink-900/30 dark:hover:to-purple-900/30 grid min-h-10 grid-cols-[auto_1fr] items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:shadow-sm"
                      >
                        <IconHome2 className="size-5" />
                        <span>Home</span>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/products"
                        className="text-foreground hover:bg-linear-to-r hover:from-pink-100 hover:to-purple-100 dark:hover:from-pink-900/30 dark:hover:to-purple-900/30 grid min-h-10 grid-cols-[auto_1fr] items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:shadow-sm"
                      >
                        <IconBuildingStore className="size-5" />
                        <span>Shop</span>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/track-order"
                        className="text-foreground hover:bg-linear-to-r hover:from-pink-100 hover:to-purple-100 dark:hover:from-pink-900/30 dark:hover:to-purple-900/30 grid min-h-10 grid-cols-[auto_1fr] items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:shadow-sm"
                      >
                        <IconPackage className="size-5" />
                        <span>Track Order</span>
                      </Link>
                    </SheetClose>
                  </div>

                  <Separator className="my-1" />

                  <div className="space-y-2">
                    <p className="text-muted-foreground px-2 text-xs font-semibold uppercase tracking-wider">
                      Shop by Category
                    </p>
                    <nav
                      className="border-border bg-linear-to-br from-pink-50/50 to-purple-50/50 dark:from-pink-950/10 dark:to-purple-950/10 grid gap-2 rounded-lg border p-3"
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
            className="text-foreground grid auto-cols-max grid-flow-col items-center justify-self-center gap-2 group"
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
                <div className="bg-linear-to-br from-pink-500 to-purple-600 text-white grid lg:size-12 size-10 place-items-center rounded-xl text-lg lg:text-xl font-bold shadow-lg transition-transform duration-300 group-hover:scale-105">
                  {brandName.charAt(0)}
                </div>
                <p className="text-xs font-semibold text-center bg-linear-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent hidden lg:block">
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
                  className="relative hover:bg-pink-100 dark:hover:bg-pink-900/20 transition-colors duration-200"
                  aria-label="Open global search"
                >
                  <IconSearch className="size-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-screen sm:w-96 p-4 shadow-xl"
                sideOffset={12}
                side="bottom"
              >
                <div className="grid gap-4">
                  <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                    <div className="bg-linear-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 p-2 rounded-lg">
                      <IconSearch className="size-5 text-pink-600 dark:text-pink-400" />
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
                    className="h-11 border-pink-200 dark:border-pink-800 focus-visible:ring-pink-400"
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
                            className="justify-start hover:bg-linear-to-r"
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
                                    <span className="bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 rounded px-1.5 py-0.5 text-[10px] font-semibold">
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
              className="relative hover:bg-pink-100 dark:hover:bg-pink-900/20 transition-colors duration-200"
              aria-label="View shopping cart"
            >
              <Link href="/cart">
                <IconShoppingCart className="size-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-linear-to-r from-pink-500 to-purple-500 border-0 grid min-w-5 h-5 place-items-center rounded-full px-1 text-[10px] font-bold shadow-md">
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
