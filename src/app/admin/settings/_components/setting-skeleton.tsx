"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

export function SettingSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="border-border">
          <CardHeader>
            <Skeleton className="h-5 w-32 bg-muted" />
            <Skeleton className="h-4 w-64 bg-muted" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full bg-muted" />
            <Skeleton className="h-10 w-full bg-muted" />
            <Skeleton className="h-10 w-1/2 bg-muted" />
          </CardContent>
        </Card>
      ))}
      <div className="flex justify-end">
        <Skeleton className="h-10 w-28 bg-muted" />
      </div>
    </div>
  );
}
