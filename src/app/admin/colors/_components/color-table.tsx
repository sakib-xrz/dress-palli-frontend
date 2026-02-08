"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { useUpdateColor } from "@/hooks/use-colors";
import type { Color } from "@/lib/type";

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

interface ColorTableProps {
  colors: Color[];
  onEdit: (color: Color) => void;
  onDelete: (color: Color) => void;
}

export function ColorTable({ colors, onEdit, onDelete }: ColorTableProps) {
  return (
    <div className="rounded-lg border">
      <Table className="min-w-[640px] table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead className="w-[160px]">Color Code</TableHead>
            <TableHead className="w-[80px] text-center">Preview</TableHead>
            <TableHead className="w-[160px] text-center">Published</TableHead>
            <TableHead className="w-12 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {colors.map((color) => (
            <ColorRow
              key={color.id}
              color={color}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ── Color Row ─────────────────────────────────────────────

interface ColorRowProps {
  color: Color;
  onEdit: (color: Color) => void;
  onDelete: (color: Color) => void;
}

function ColorRow({ color, onEdit, onDelete }: ColorRowProps) {
  const updateMutation = useUpdateColor();

  const handleStatusToggle = (checked: boolean) => {
    updateMutation.mutate({
      id: color.id,
      data: { is_active: checked },
    });
  };

  return (
    <TableRow>
      {/* Name */}
      <TableCell className="font-medium truncate">{color.name}</TableCell>

      {/* Color Code */}
      <TableCell className="truncate">
        {color.code ? (
          <code className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-xs font-mono">
            {color.code}
          </code>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>

      {/* Preview */}
      <TableCell className="text-center">
        {color.code ? (
          <div className="flex justify-center">
            <div
              className="size-6 rounded-full border border-border shadow-sm"
              style={{ backgroundColor: color.code }}
              title={color.code}
            />
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>

      {/* Published */}
      <TableCell className="text-center justify-center items-center flex">
        <div className="flex items-center gap-2 rounded-md border px-2 py-1 w-32">
          <Switch
            size="sm"
            checked={color.is_active}
            onCheckedChange={handleStatusToggle}
            disabled={updateMutation.isPending}
            aria-label={`Toggle ${color.name} status`}
            className="cursor-pointer"
          />
          <span className="text-xs text-muted-foreground w-16">
            {color.is_active ? "Published" : "Unpublished"}
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
            <DropdownMenuItem onClick={() => onEdit(color)}>
              <Pencil className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(color)}
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
