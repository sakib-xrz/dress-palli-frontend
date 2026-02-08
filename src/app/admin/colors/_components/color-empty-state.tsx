import { Palette } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ColorEmptyStateProps {
  onAddColor: () => void;
}

export function ColorEmptyState({ onAddColor }: ColorEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Palette className="size-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No colors yet</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by creating your first color.
      </p>
      <Button className="mt-4" onClick={onAddColor}>
        Add Color
      </Button>
    </div>
  );
}
