import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

export function CustomerEmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16 text-center px-4">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted mb-4">
          <Users className="size-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">No customers yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Customers will appear here when they place orders. You&apos;ll be able
          to view and manage them from this page.
        </p>
      </CardContent>
    </Card>
  );
}
