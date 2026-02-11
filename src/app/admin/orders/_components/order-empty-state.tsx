import { Card, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";

export function OrderEmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted mb-4">
          <Package className="size-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">No orders yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Orders placed by customers will appear here. You&apos;ll be able to
          track and manage them from this page.
        </p>
      </CardContent>
    </Card>
  );
}
