"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { PublicSetting } from "@/lib/type";

type SettingsContextValue = {
  settings: PublicSetting | null;
};

const SettingsContext = createContext<SettingsContextValue | undefined>(
  undefined,
);

type SettingsProviderProps = {
  children: ReactNode;
  initialSettings: PublicSetting | null;
};

export function SettingsProvider({
  children,
  initialSettings,
}: SettingsProviderProps) {
  const value = useMemo(
    () => ({ settings: initialSettings }),
    [initialSettings],
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useGlobalSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error(
      "useGlobalSettings must be used within a SettingsProvider",
    );
  }

  return context;
}
