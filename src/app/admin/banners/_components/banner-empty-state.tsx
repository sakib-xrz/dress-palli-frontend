"use client";

import { Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface BannerEmptyStateProps {
  onAddBanner: () => void;
}

export function BannerEmptyState({ onAddBanner }: BannerEmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <ImageIcon className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="mt-6 text-lg font-semibold">No banners yet</h3>
        <p className="mt-2 text-center text-sm text-muted-foreground max-w-sm">
          Create your first banner to display promotional content on your
          homepage.
        </p>
        <Button onClick={onAddBanner} className="mt-6">
          Add Your First Banner
        </Button>
      </CardContent>
    </Card>
  );
}
