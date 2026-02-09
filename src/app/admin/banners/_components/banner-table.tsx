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

import { useReorderBanners, useUpdateBanner } from "@/hooks/use-banners";
import type { Banner } from "@/lib/type";

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

interface DraggableBannerRowProps {
  banner: Banner;
  index: number;
  onEdit: (banner: Banner) => void;
  onDelete: (banner: Banner) => void;
}

function DraggableBannerRow({
  banner,
  index,
  onEdit,
  onDelete,
}: DraggableBannerRowProps) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: banner.id,
  });
  const updateMutation = useUpdateBanner();

  const handleStatusToggle = (checked: boolean) => {
    updateMutation.mutate({
      id: banner.id,
      data: { is_active: checked },
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
        <DragHandle id={banner.id} />
      </TableCell>

      {/* Image */}
      <TableCell>
        <div className="h-auto w-40 rounded-md border bg-muted">
          <Image
            src={banner.image_url}
            alt="Banner"
            width={160}
            height={90}
            className="object-cover"
          />
        </div>
      </TableCell>

      {/* Sort Order */}
      <TableCell className="text-center">
        <Badge variant="outline" className="font-mono">
          {index + 1}
        </Badge>
      </TableCell>

      {/* Active Status */}
      <TableCell>
        <div className="flex items-center justify-center">
          <Switch
            checked={banner.is_active}
            onCheckedChange={handleStatusToggle}
            disabled={updateMutation.isPending}
          />
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
            <DropdownMenuItem onClick={() => onEdit(banner)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(banner)}
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

interface BannerTableProps {
  banners: Banner[];
  onEdit: (banner: Banner) => void;
  onDelete: (banner: Banner) => void;
}

export function BannerTable({ banners, onEdit, onDelete }: BannerTableProps) {
  const [localBanners, setLocalBanners] = useState(banners);
  const reorderMutation = useReorderBanners();

  useEffect(() => {
    setLocalBanners(banners);
  }, [banners]);

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  );

  const dataIds: UniqueIdentifier[] = localBanners.map((banner) => banner.id);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active || !over || active.id === over.id) return;

    const oldIndex = dataIds.indexOf(active.id);
    const newIndex = dataIds.indexOf(over.id);
    const reordered = arrayMove(localBanners, oldIndex, newIndex);

    setLocalBanners(reordered);

    const items = reordered.map((banner, index) => ({
      id: banner.id,
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
              <TableHead className="w-[100px] text-center">Order</TableHead>
              <TableHead className="w-[130px] text-center">Active</TableHead>
              <TableHead className="w-12 text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            <SortableContext
              items={dataIds}
              strategy={verticalListSortingStrategy}
            >
              {localBanners.map((banner, index) => (
                <DraggableBannerRow
                  key={banner.id}
                  banner={banner}
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
