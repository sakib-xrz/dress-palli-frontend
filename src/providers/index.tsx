"use client";

import { QueryProvider } from "./query-provider";
import { NuqsProvider } from "./nuqs-provider";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <NuqsProvider>
        {children}
        <Toaster position="bottom-right" richColors visibleToasts={1} />
      </NuqsProvider>
    </QueryProvider>
  );
}
