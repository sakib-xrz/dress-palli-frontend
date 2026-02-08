"use client";

import { useState } from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { useUpdateSize, useReorderSizes } from "@/hooks/use-sizes";
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

// ── Drag Handle ───────────────────────────────────────────

function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({ id });

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon-xs"
      className="text-muted-foreground cursor-grab active:cursor-grabbing hover:bg-transparent"
    >
      <GripVertical className="size-4" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

// ── Draggable Row ─────────────────────────────────────────

interface DraggableSizeRowProps {
  size: Size;
  onEdit: (size: Size) => void;
  onDelete: (size: Size) => void;
}

function DraggableSizeRow({ size, onEdit, onDelete }: DraggableSizeRowProps) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: size.id,
  });

  const updateMutation = useUpdateSize();

  const handleStatusToggle = (checked: boolean) => {
    updateMutation.mutate({
      id: size.id,
      data: { is_published: checked },
    });
  };

  return (
    <TableRow
      ref={setNodeRef}
      data-dragging={isDragging}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      {/* Drag Handle */}
      <TableCell className="w-10">
        <DragHandle id={size.id} />
      </TableCell>

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
            checked={size.is_published}
            onCheckedChange={handleStatusToggle}
            disabled={updateMutation.isPending}
            aria-label={`Toggle ${size.name} status`}
            className="cursor-pointer"
          />
          <span className="text-xs text-muted-foreground w-16">
            {size.is_published ? "Published" : "Unpublished"}
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

// ── Size Table ────────────────────────────────────────────

interface SizeTableProps {
  sizes: Size[];
  onEdit: (size: Size) => void;
  onDelete: (size: Size) => void;
}

export function SizeTable({ sizes, onEdit, onDelete }: SizeTableProps) {
  const [localSizes, setLocalSizes] = useState(sizes);
  const reorderMutation = useReorderSizes();

  // Keep local state in sync with prop changes (e.g. after create/delete/update)
  const [prevSizes, setPrevSizes] = useState(sizes);
  if (sizes !== prevSizes) {
    setPrevSizes(sizes);
    setLocalSizes(sizes);
  }

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  );

  const dataIds: UniqueIdentifier[] = localSizes.map((s) => s.id);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!active || !over || active.id === over.id) return;

    const oldIndex = dataIds.indexOf(active.id);
    const newIndex = dataIds.indexOf(over.id);
    const reordered = arrayMove(localSizes, oldIndex, newIndex);

    // Optimistically update local state
    setLocalSizes(reordered);

    // Build payload with new sort_order values
    const items = reordered.map((size, index) => ({
      id: size.id,
      sort_order: index,
    }));

    reorderMutation.mutate({ items });
  }

  return (
    <div className="rounded-lg border">
      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <Table className="min-w-[640px] table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead className="w-[130px] text-center">
                Sort Order
              </TableHead>
              <TableHead className="w-[160px] text-center">Published</TableHead>
              <TableHead className="w-12 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <SortableContext
              items={dataIds}
              strategy={verticalListSortingStrategy}
            >
              {localSizes.map((size) => (
                <DraggableSizeRow
                  key={size.id}
                  size={size}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </SortableContext>
          </TableBody>
        </Table>
      </DndContext>
    </div>
  );
}
