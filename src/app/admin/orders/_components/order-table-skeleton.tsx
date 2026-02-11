import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function OrderTableSkeleton() {
  return (
    <div className="space-y-4">
      <Card className="py-0">
        <CardContent className="p-0">
          <div className="overflow-auto rounded-b-xl">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="bg-muted/50 sticky top-0 z-10 font-semibold">
                    Order ID
                  </TableHead>
                  <TableHead className="bg-muted/50 sticky top-0 z-10 font-semibold">
                    Customer
                  </TableHead>
                  <TableHead className="bg-muted/50 sticky top-0 z-10 font-semibold text-center">
                    Items
                  </TableHead>
                  <TableHead className="bg-muted/50 sticky top-0 z-10 font-semibold text-right">
                    Amount
                  </TableHead>
                  <TableHead className="bg-muted/50 sticky top-0 z-10 font-semibold text-center">
                    Order Status
                  </TableHead>
                  <TableHead className="bg-muted/50 sticky top-0 z-10 font-semibold text-center">
                    Payment
                  </TableHead>
                  <TableHead className="bg-muted/50 sticky top-0 z-10 font-semibold w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <Skeleton className="h-5 w-8" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24 ml-auto" />
                        <Skeleton className="h-3 w-32 ml-auto" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <Skeleton className="h-8 w-32" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <Skeleton className="h-8 w-32" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Skeleton className="h-8 w-8 rounded-md" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-32" />
      </div>
    </div>
  );
}
