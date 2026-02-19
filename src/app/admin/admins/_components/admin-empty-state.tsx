import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

interface AdminEmptyStateProps {
  onAddAdmin: () => void;
}

export function AdminEmptyState({ onAddAdmin }: AdminEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 px-4">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <ShieldCheck className="size-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No admins found</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Create your first admin account to get started.
      </p>
      <Button className="mt-4" onClick={onAddAdmin}>
        Add Admin
      </Button>
    </div>
  );
}
