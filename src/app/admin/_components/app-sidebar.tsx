"use client";

import * as React from "react";
import {
  IconCategory,
  IconDashboard,
  IconPackage,
  IconPalette,
  IconPolaroid,
  IconRuler,
  IconSettings,
  IconShoppingCart,
  IconUsers,
  IconStar,
} from "@tabler/icons-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import Link from "next/link";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navGroups: [
    {
      label: "Overview",
      items: [
        {
          title: "Dashboard",
          url: "/admin/dashboard",
          icon: IconDashboard,
        },
      ],
    },
    {
      label: "Catalog",
      items: [
        {
          title: "Categories",
          url: "/admin/categories",
          icon: IconCategory,
        },
        {
          title: "Products",
          icon: IconPackage,
          subItems: [
            {
              title: "Create Product",
              url: "/admin/products/new",
            },
            {
              title: "Products List",
              url: "/admin/products",
            },
          ],
        },
        {
          title: "Colors",
          url: "/admin/colors",
          icon: IconPalette,
        },
        {
          title: "Sizes",
          url: "/admin/sizes",
          icon: IconRuler,
        },
      ],
    },
    {
      label: "Sales",
      items: [
        {
          title: "Orders",
          url: "/admin/orders",
          icon: IconShoppingCart,
        },
        {
          title: "Customers",
          url: "/admin/customers",
          icon: IconUsers,
        },
      ],
    },
    {
      label: "General",
      items: [
        {
          title: "Banners",
          url: "/admin/banners",
          icon: IconPolaroid,
        },
        {
          title: "Featuring",
          url: "/admin/featuring",
          icon: IconStar,
        },
        {
          title: "Settings",
          url: "/admin/settings",
          icon: IconSettings,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="p-2">
              <Link href="/">
                <span className="text-base font-semibold">Dress Palli</span>
              </Link>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain groups={data.navGroups} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
