"use client";

import { usePathname } from "next/navigation";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

const pageTitles: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/categories": "Categories",
  "/admin/products/new": "Create Product",
  "/admin/products": "Products List",
  "/admin/products/[id]": "Product Details",
  "/admin/colors": "Colors",
  "/admin/sizes": "Sizes",
  "/admin/orders": "Orders",
  "/admin/orders/[id]": "Order Details",
  "/admin/customers": "Customers",
  "/admin/banners": "Banners",
  "/admin/featuring": "Featuring",
  "/admin/settings": "Settings",
};

function getPageTitle(pathname: string): string {
  // Exact match first
  if (pageTitles[pathname]) return pageTitles[pathname];

  // Try to match dynamic routes (e.g., /admin/products/[id])
  for (const [pattern, title] of Object.entries(pageTitles)) {
    if (pattern.includes("[id]")) {
      // Convert pattern to regex: /admin/products/[id] -> /admin/products/.+
      const regexPattern = pattern.replace(/\[id\]/g, "[^/]+");
      const regex = new RegExp(`^${regexPattern}$`);
      if (regex.test(pathname)) {
        return title;
      }
    }
  }

  // Fallback: capitalize the last segment of the path
  const segments = pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1] ?? "";
  return last.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function SiteHeader() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{title}</h1>
      </div>
    </header>
  );
}
