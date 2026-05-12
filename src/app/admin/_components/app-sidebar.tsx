"use client";

import * as React from "react";
import {
  IconCategory,
  IconDashboard,
  IconPackage,
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
import { useAuthUser } from "@/hooks/use-auth";
import Link from "next/link";

const navGroups = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        url: "/admin/dashboard",
        icon: IconDashboard,
      },
      {
        title: "Admins",
        url: "/admin/admins",
        icon: IconUsers,
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
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: user } = useAuthUser();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const isAdmin = user?.role === "ADMIN";

  const adminOnlyNavGroups = [
    {
      label: "Sales",
      items: [
        {
          title: "Products",
          url: "/admin/products",
          icon: IconPackage,
        },
        {
          title: "Orders",
          url: "/admin/orders",
          icon: IconShoppingCart,
        },
      ],
    },
  ];

  const resolvedNavGroups = isAdmin
    ? adminOnlyNavGroups
    : navGroups.map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          if (item.url === "/admin/admins") {
            return isSuperAdmin;
          }
          return true;
        }),
      }));

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="p-2">
              <Link href="/">
                <span className="text-base font-semibold">Dress Point</span>
              </Link>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain groups={resolvedNavGroups} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
