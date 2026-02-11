"use client";

import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";

interface FeaturingEmptyStateProps {
  onAddFeaturing: () => void;
}

export function FeaturingEmptyState({
  onAddFeaturing,
}: FeaturingEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 px-4">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Star className="size-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No featured categories yet</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by featuring your first category on the homepage.
      </p>
      <Button className="mt-4" onClick={onAddFeaturing}>
        Add Featured
      </Button>
    </div>
  );
}
