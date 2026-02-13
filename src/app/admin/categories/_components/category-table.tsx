"use client";

import Image from "next/image";
import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

import { useUpdateCategoryStatus } from "@/hooks/use-categories";
import type { Category, CategoryChild } from "@/lib/type";

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

interface CategoryTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function CategoryTable({
  categories,
  onEdit,
  onDelete,
}: CategoryTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="rounded-lg border">
      <Table className="min-w-[760px] table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-8" />
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead className="w-[90px]">Image</TableHead>
            <TableHead className="w-[180px]">Slug</TableHead>
            <TableHead className="w-[130px] text-center">
              Sub-Categories
            </TableHead>
            <TableHead className="w-[160px] text-center">Published</TableHead>
            <TableHead className="w-12 text-right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <CategoryTableGroup
              key={category.id}
              category={category}
              isExpanded={expandedRows.has(category.id)}
              onToggle={() => toggleRow(category.id)}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ── Parent row + children ────────────────────────────────

interface CategoryTableGroupProps {
  category: Category;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

function CategoryTableGroup({
  category,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
}: CategoryTableGroupProps) {
  const children = category.children ?? [];
  const hasChildren = children.length > 0;

  return (
    <>
      {/* Parent Row */}
      <ParentRow
        category={category}
        hasChildren={hasChildren}
        isExpanded={isExpanded}
        onToggle={onToggle}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      {/* Children Rows */}
      {isExpanded &&
        children.map((child) => (
          <ChildRow
            key={child.id}
            child={child}
            parentId={category.id}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
    </>
  );
}

// ── Parent Row ───────────────────────────────────────────

interface ParentRowProps {
  category: Category;
  hasChildren: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

function ParentRow({
  category,
  hasChildren,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
}: ParentRowProps) {
  const statusMutation = useUpdateCategoryStatus();

  const handleStatusToggle = (checked: boolean) => {
    statusMutation.mutate({
      id: category.id,
      data: { is_active: checked },
    });
  };

  return (
    <TableRow>
      {/* Expand/Collapse */}
      <TableCell className="w-8">
        {hasChildren ? (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onToggle}
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </Button>
        ) : null}
      </TableCell>

      {/* Name */}
      <TableCell className="font-medium truncate">{category.name}</TableCell>

      {/* Image */}
      <TableCell>
        {category.image_url ? (
          <div className="relative h-10 w-14 overflow-hidden rounded border">
            <Image
              src={category.image_url}
              alt={`${category.name} image`}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>

      {/* Slug */}
      <TableCell className="truncate">
        <code className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-xs font-mono">
          {category.slug}
        </code>
      </TableCell>

      {/* Subcategories Count */}
      <TableCell className="text-center">
        {hasChildren ? (
          <Badge variant="outline" className="size-8 text-center">
            {category.children?.length}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>

      {/* Published */}
      <TableCell className="text-center justify-center items-center flex">
        <div className="flex items-center gap-2 rounded-md border px-2 py-1 w-30">
          <Switch
            size="sm"
            checked={category.is_active}
            onCheckedChange={handleStatusToggle}
            disabled={statusMutation.isPending}
            aria-label={`Toggle ${category.name} status`}
            className="cursor-pointer"
          />
          <span className="text-xs text-muted-foreground w-16">
            {category.is_active ? "Published" : "Unpublished"}
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
            <DropdownMenuItem onClick={() => onEdit(category)}>
              <Pencil className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(category)}
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

// ── Child Row ────────────────────────────────────────────

interface ChildRowProps {
  child: CategoryChild;
  parentId: string;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

function ChildRow({ child, parentId, onEdit, onDelete }: ChildRowProps) {
  const statusMutation = useUpdateCategoryStatus();

  const handleStatusToggle = (checked: boolean) => {
    statusMutation.mutate({
      id: child.id,
      data: { is_active: checked },
    });
  };

  // Convert CategoryChild to a Category shape for edit/delete
  const asCategory: Category = {
    ...child,
    image_url: null,
    parent_id: parentId,
    created_at: "",
    updated_at: "",
  };

  return (
    <TableRow className="bg-muted/30">
      {/* Indent spacer */}
      <TableCell />

      {/* Name with indent */}
      <TableCell className="truncate">
        <div className="flex items-center gap-2 pl-4">
          <span className="truncate">{child.name}</span>
        </div>
      </TableCell>

      {/* Image */}
      <TableCell>
        <span className="text-xs text-muted-foreground">—</span>
      </TableCell>

      {/* Slug */}
      <TableCell className="truncate">
        <code className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-xs font-mono">
          {child.slug}
        </code>
      </TableCell>

      {/* Subcategories (children don't have sub-children in this model) */}
      <TableCell className="text-center">
        <span className="text-xs text-muted-foreground">—</span>
      </TableCell>

      {/* Published */}
      <TableCell className="text-center justify-center items-center flex">
        <div className="flex items-center gap-2 rounded-md border px-2 py-1 w-32">
          <Switch
            size="sm"
            checked={child.is_active}
            onCheckedChange={handleStatusToggle}
            disabled={statusMutation.isPending}
            aria-label={`Toggle ${child.name} status`}
            className="cursor-pointer"
          />
          <span className="text-xs text-muted-foreground w-16">
            {child.is_active ? "Published" : "Unpublished"}
          </span>
        </div>
      </TableCell>

      {/* Actions */}
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-xs">
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Actions for {child.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(asCategory)}>
              <Pencil className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(asCategory)}
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
