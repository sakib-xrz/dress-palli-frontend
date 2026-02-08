"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { useUpdateSize } from "@/hooks/use-sizes";
import type { Size } from "@/lib/type";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SizeTableProps {
  sizes: Size[];
  onEdit: (size: Size) => void;
  onDelete: (size: Size) => void;
}

export function SizeTable({ sizes, onEdit, onDelete }: SizeTableProps) {
  return (
    <div className="rounded-lg border">
      <Table className="min-w-[640px] table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead className="w-[130px] text-center">Sort Order</TableHead>
            <TableHead className="w-[160px] text-center">Published</TableHead>
            <TableHead className="w-12 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sizes.map((size) => (
            <SizeRow
              key={size.id}
              size={size}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ── Size Row ──────────────────────────────────────────────

interface SizeRowProps {
  size: Size;
  onEdit: (size: Size) => void;
  onDelete: (size: Size) => void;
}

function SizeRow({ size, onEdit, onDelete }: SizeRowProps) {
  const updateMutation = useUpdateSize();

  const handleStatusToggle = (checked: boolean) => {
    updateMutation.mutate({
      id: size.id,
      data: { is_active: checked },
    });
  };

  return (
    <TableRow>
      {/* Name */}
      <TableCell className="font-medium truncate">{size.name}</TableCell>

      {/* Sort Order */}
      <TableCell className="text-center">
        <Badge variant="outline" className="size-8 text-center">
          {size.sort_order}
        </Badge>
      </TableCell>

      {/* Published */}
      <TableCell className="text-center justify-center items-center flex">
        <div className="flex items-center gap-2 rounded-md border px-2 py-1 w-32">
          <Switch
            size="sm"
            checked={size.is_active}
            onCheckedChange={handleStatusToggle}
            disabled={updateMutation.isPending}
            aria-label={`Toggle ${size.name} status`}
            className="cursor-pointer"
          />
          <span className="text-xs text-muted-foreground w-16">
            {size.is_active ? "Published" : "Unpublished"}
          </span>
        </div>
      </TableCell>

      {/* Actions */}
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-xs">
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(size)}>
              <Pencil className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(size)}
            >
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
