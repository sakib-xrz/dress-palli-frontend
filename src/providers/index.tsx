"use client";

import { QueryProvider } from "./query-provider";
import { NuqsProvider } from "./nuqs-provider";
import { Toaster } from "@/components/ui/sonner";
import { SettingsProvider } from "@/contexts/settings-context";
import type { PublicSetting } from "@/lib/type";

type ProvidersProps = {
  children: React.ReactNode;
  initialSettings: PublicSetting | null;
};

export function Providers({ children, initialSettings }: ProvidersProps) {
  return (
    <SettingsProvider initialSettings={initialSettings}>
      <QueryProvider>
        <NuqsProvider>
          {children}
          <Toaster position="bottom-right" richColors visibleToasts={1} />
        </NuqsProvider>
      </QueryProvider>
    </SettingsProvider>
  );
}
