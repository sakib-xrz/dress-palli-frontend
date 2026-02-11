import { Ruler } from "lucide-react";

import { Button } from "@/components/ui/button";

interface SizeEmptyStateProps {
  onAddSize: () => void;
}

export function SizeEmptyState({ onAddSize }: SizeEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 px-4">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Ruler className="size-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No sizes yet</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by creating your first size.
      </p>
      <Button className="mt-4" onClick={onAddSize}>
        Add Size
      </Button>
    </div>
  );
}
