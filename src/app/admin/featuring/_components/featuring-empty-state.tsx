"use client";

import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface FeaturingEmptyStateProps {
  onAddFeaturing: () => void;
}

export function FeaturingEmptyState({
  onAddFeaturing,
}: FeaturingEmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center px-4 py-16">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Star className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="mt-6 text-lg font-semibold">No featured categories yet</h3>
        <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
          Add your first featured category to highlight curated products on the
          homepage.
        </p>
        <Button className="mt-6" onClick={onAddFeaturing}>
          Add Your First Featured Category
        </Button>
      </CardContent>
    </Card>
  );
}
