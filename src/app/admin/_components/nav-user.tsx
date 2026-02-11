"use client";

import { IconLoader2, IconLogout } from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useLogout, type AuthUser } from "@/hooks/use-auth";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function NavUser({ user }: { user: AuthUser | undefined }) {
  const { logout, isLoggingOut } = useLogout();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="group flex items-center gap-2 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground p-2 rounded-md transition-all duration-200 ease-in-out cursor-default">
          <Avatar className="h-8 w-8 rounded-lg grayscale transition-all duration-200">
            <AvatarImage src="" alt={user?.name ?? "User"} />
            <AvatarFallback className="rounded-lg">
              {user ? getInitials(user.name) : ".."}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">
              {user?.name ?? "Loading..."}
            </span>
            <span className="text-muted-foreground truncate text-xs">
              {user?.email ?? ""}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="bg-white hover:bg-destructive! transition-all duration-200 hover:text-white cursor-pointer"
            onClick={logout}
            disabled={isLoggingOut}
            title="Sign out"
          >
            {isLoggingOut ? (
              <IconLoader2 className="animate-spin" />
            ) : (
              <IconLogout />
            )}
          </Button>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
