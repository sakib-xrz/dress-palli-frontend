"use client";

import { useState } from "react";

import { useSettings } from "@/hooks/use-settings";

import { SettingForm } from "./_components/setting-form";
import { SettingSkeleton } from "./_components/setting-skeleton";
import { SettingEmptyState } from "./_components/setting-empty-state";

export default function SettingsPage() {
  const [showInitForm, setShowInitForm] = useState(false);

  const { data: setting, isLoading } = useSettings();

  // When no settings and user clicks Configure, show init form
  const displayInitForm = !setting && showInitForm;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your store settings, contact info, and preferences.
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <SettingSkeleton />
      ) : !setting && !displayInitForm ? (
        <SettingEmptyState onConfigure={() => setShowInitForm(true)} />
      ) : (
        <SettingForm setting={setting ?? undefined} isInit={displayInitForm} />
      )}
    </div>
  );
}
