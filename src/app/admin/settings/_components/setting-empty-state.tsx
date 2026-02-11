"use client";

import { Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SettingEmptyStateProps {
  onConfigure: () => void;
}

export function SettingEmptyState({ onConfigure }: SettingEmptyStateProps) {
  return (
    <Card className="border-dashed border-border bg-card">
      <CardHeader className="text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted">
          <Settings className="size-7 text-muted-foreground" />
        </div>
        <CardTitle className="mt-4 text-foreground">Settings not configured</CardTitle>
        <CardDescription className="text-muted-foreground">
          Get started by configuring your store settings. You&apos;ll set up
          branding, contact info, and preferences.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Button onClick={onConfigure}>Configure Settings</Button>
      </CardContent>
    </Card>
  );
}
