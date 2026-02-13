"use client";

import Link from "next/link";
import {
  IconCategory2,
  IconChevronDown,
  IconHome2,
  IconMenu2,
  IconSearch,
  IconShoppingCart,
} from "@tabler/icons-react";
import { useGlobalSettings } from "@/contexts/settings-context";
import type { Category } from "@/lib/type";
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
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

const searchSuggestions = ["Saree", "Three Piece"];

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
  const cartCount = 3;
  const categoryTree = categories as CategoryTreeNode[];

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
              className="text-foreground hover:bg-accent hover:text-accent-foreground grid min-h-9 items-center rounded-md px-3 py-2 text-sm font-medium transition-colors"
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
                className="text-foreground hover:bg-accent hover:text-accent-foreground grid min-h-9 items-center rounded-md px-3 py-2 text-sm font-semibold transition-colors"
              >
                {node.name}
              </Link>
            </SheetClose>

            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-8 [&[data-state=open]>svg]:rotate-180"
                aria-label={`Toggle ${node.name} subcategories`}
              >
                <IconChevronDown className="size-4 transition-transform" />
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent className="border-border ml-3 grid gap-1 border-l">
            {renderCategoryNodes(childNodes, currentSlugs, depth + 1)}
          </CollapsibleContent>
        </Collapsible>
      );
    });
  };

  return (
    <header className="border-border bg-background/95 supports-backdrop-filter:bg-background/80 sticky top-0 z-50 border-b backdrop-blur">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3.5 md:gap-4 h-[5rem]">
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
            <SheetContent side="left" className="grid grid-rows-[auto_1fr] gap-0 p-0">
              <SheetHeader className="bg-muted/30 border-border border-b px-5 py-4">
                <SheetTitle className="grid grid-cols-[auto_1fr] items-center gap-2">
                  <IconCategory2 className="text-primary size-4" />
                  <span>{brandName}</span>
                </SheetTitle>
                <SheetDescription>
                  Discover trending styles and latest arrivals.
                </SheetDescription>
              </SheetHeader>

              <div className="grid content-start gap-3 overflow-y-auto px-3 py-3">
                <SheetClose asChild>
                  <Link
                    href="/"
                    className="text-foreground hover:bg-accent hover:text-accent-foreground grid min-h-9 grid-cols-[auto_1fr] items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors"
                  >
                    <IconHome2 className="size-4" />
                    <span>Home</span>
                  </Link>
                </SheetClose>

                <Separator />

                <nav
                  className="border-border bg-muted/20 grid gap-2 rounded-md border p-2"
                  aria-label="Category menu"
                >
                  {renderCategoryNodes(categoryTree)}

                  {categories.length === 0 && (
                    <p className="text-muted-foreground px-3 py-2 text-sm">
                      Categories are not available right now.
                    </p>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <Link
          href="/"
          className="text-foreground grid auto-cols-max grid-flow-col items-center justify-self-center gap-2"
        >
          {logo ? (
            <Image
              src={logo}
              alt={brandName}
              width={100}
              height={100}
              className="relative aspect-square size-12 object-contain"
            />
          ) : (
            <div className="bg-primary text-primary-foreground grid size-10 place-items-center rounded-md text-sm font-semibold">
              {brandName.charAt(0)}
            </div>
          )}
        </Link>

        <div className="grid grid-flow-col auto-cols-max items-center justify-self-end gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="relative shadow-xs"
                aria-label="Open global search"
              >
                <IconSearch className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-screen sm:w-80 p-3"
              sideOffset={8}
              side="bottom"
            >
              <div className="grid gap-3">
                <div className="grid grid-cols-[auto_1fr] items-center gap-2">
                  <IconSearch className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Global Search</p>
                    <p className="text-muted-foreground text-xs">
                      Search by products or categories name
                    </p>
                  </div>
                </div>
                <Input placeholder="Search for anything..." />
                <div className="grid grid-cols-2 gap-2">
                  {searchSuggestions.map((item) => (
                    <Button
                      key={item}
                      variant="secondary"
                      size="sm"
                      className="justify-start"
                    >
                      {item}
                    </Button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            asChild
            variant="outline"
            size="icon"
            className="relative shadow-xs"
            aria-label="View shopping cart"
          >
            <Link href="/cart">
              <IconShoppingCart className="size-4" />
              <Badge
                variant="default"
                className="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full px-1 text-[10px]"
              >
                {cartCount}
              </Badge>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
