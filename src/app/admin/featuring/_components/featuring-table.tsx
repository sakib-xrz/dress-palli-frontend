"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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

import {
  useReorderFeaturedCategories,
  useUpdateFeaturedCategory,
} from "@/hooks/use-featured-categories";
import type { FeaturedCategory } from "@/lib/type";

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

interface DraggableFeaturingRowProps {
  featuring: FeaturedCategory;
  index: number;
  onEdit: (featuring: FeaturedCategory) => void;
  onDelete: (featuring: FeaturedCategory) => void;
}

function DraggableFeaturingRow({
  featuring,
  index,
  onEdit,
  onDelete,
}: DraggableFeaturingRowProps) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: featuring.id,
  });
  const updateMutation = useUpdateFeaturedCategory();

  const handleStatusToggle = (checked: boolean) => {
    updateMutation.mutate({
      id: featuring.id,
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
        <DragHandle id={featuring.id} />
      </TableCell>

      {/* Image */}
      <TableCell>
          {featuring.banner_url ? (
            <Image
              src={featuring.banner_url}
              alt={featuring.title}
              width={160}
              height={90}
              className="object-contain aspect-21/8"
            />
          ) : (
            <div className="flex h-[90px] w-[160px] items-center justify-center rounded-md bg-muted text-muted-foreground text-xs">
              No image
            </div>
          )}
      </TableCell>

      {/* Category */}
      <TableCell className="font-medium truncate">
        <div className="flex flex-col gap-0.5">
          <span>{featuring.category.name}</span>
          <span className="text-xs text-muted-foreground truncate">
            {featuring.title}
          </span>
        </div>
      </TableCell>

      {/* Sort Order */}
      <TableCell className="text-center">
        <Badge variant="outline" className="font-mono">
          {index + 1}
        </Badge>
      </TableCell>

      {/* Published */}
      <TableCell>
        <div className="flex items-center justify-center gap-2">
          <div className="flex items-center gap-2 rounded-md border px-2 py-1 w-30">
            <Switch
              size="sm"
              checked={featuring.is_published}
              onCheckedChange={handleStatusToggle}
              disabled={updateMutation.isPending}
            />
            <span className="text-xs text-muted-foreground w-16">
              {featuring.is_published ? "Published" : "Unpublished"}
            </span>
          </div>
        </div>
      </TableCell>

      {/* Actions */}
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(featuring)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(featuring)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

interface FeaturingTableProps {
  featuringList: FeaturedCategory[];
  onEdit: (featuring: FeaturedCategory) => void;
  onDelete: (featuring: FeaturedCategory) => void;
}

export function FeaturingTable({
  featuringList,
  onEdit,
  onDelete,
}: FeaturingTableProps) {
  const [localList, setLocalList] = useState(featuringList);
  const reorderMutation = useReorderFeaturedCategories();

  useEffect(() => {
    setLocalList(featuringList);
  }, [featuringList]);

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  );

  const dataIds: UniqueIdentifier[] = localList.map((f) => f.id);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active || !over || active.id === over.id) return;

    const oldIndex = dataIds.indexOf(active.id);
    const newIndex = dataIds.indexOf(over.id);
    const reordered = arrayMove(localList, oldIndex, newIndex);

    setLocalList(reordered);

    const items = reordered.map((item, index) => ({
      id: item.id,
      sort_order: index,
    }));

    reorderMutation.mutate({ items });
  };

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
              <TableHead className="w-[200px]">Image</TableHead>
              <TableHead className="w-[200px]">Category</TableHead>
              <TableHead className="w-[100px] text-center">Order</TableHead>
              <TableHead className="w-[130px] text-center">Published</TableHead>
              <TableHead className="w-12 text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            <SortableContext
              items={dataIds}
              strategy={verticalListSortingStrategy}
            >
              {localList.map((featuring, index) => (
                <DraggableFeaturingRow
                  key={featuring.id}
                  featuring={featuring}
                  index={index}
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
