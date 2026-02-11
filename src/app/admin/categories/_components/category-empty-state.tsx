import { FolderOpen } from "lucide-react";

import { Button } from "@/components/ui/button";

interface CategoryEmptyStateProps {
  onAddCategory: () => void;
}

export function CategoryEmptyState({ onAddCategory }: CategoryEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 px-4">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <FolderOpen className="size-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No categories yet</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by creating your first category.
      </p>
      <Button className="mt-4" onClick={onAddCategory}>
        Add Category
      </Button>
    </div>
  );
}
