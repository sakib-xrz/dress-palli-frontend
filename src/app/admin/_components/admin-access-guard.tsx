"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useAuthUser } from "@/hooks/use-auth";

interface AdminAccessGuardProps {
  children: React.ReactNode;
}

function isAdminAllowedPath(pathname: string) {
  if (pathname === "/admin/products") return true;
  if (pathname === "/admin/orders") return true;
  if (pathname.startsWith("/admin/orders/")) return true;
  return false;
}

export function AdminAccessGuard({ children }: AdminAccessGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: user, isLoading } = useAuthUser();

  const isAdmin = user?.role === "ADMIN";
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  useEffect(() => {
    if (isLoading || !user) return;

    if (isAdmin && !isAdminAllowedPath(pathname)) {
      router.replace("/admin/products");
    }
  }, [isAdmin, isLoading, pathname, router, user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;
  if (isSuperAdmin) return <>{children}</>;
  if (isAdmin && isAdminAllowedPath(pathname)) return <>{children}</>;

  return null;
}
