"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { useColors } from "@/hooks/use-colors";
import type { Color } from "@/lib/type";

import { Button } from "@/components/ui/button";

import { ColorTable } from "./_components/color-table";
import { ColorTableSkeleton } from "./_components/color-table-skeleton";
import { ColorEmptyState } from "./_components/color-empty-state";
import { ColorFormModal } from "./_components/color-form-modal";
import { DeleteColorDialog } from "./_components/delete-color-dialog";

export default function ColorsPage() {
  // ── State ──────────────────────────────────────────
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);

  // ── Data ───────────────────────────────────────────
  const { data: colors, isLoading } = useColors();

  // ── Handlers ───────────────────────────────────────
  const handleAdd = () => {
    setSelectedColor(null);
    setFormModalOpen(true);
  };

  const handleEdit = (color: Color) => {
    setSelectedColor(color);
    setFormModalOpen(true);
  };

  const handleDelete = (color: Color) => {
    setSelectedColor(color);
    setDeleteDialogOpen(true);
  };

  // ── Render ─────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Colors</h1>
          <p className="text-sm text-muted-foreground">
            Manage your product colors for variants.
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus />
          Add Color
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <ColorTableSkeleton />
      ) : !colors || colors.length === 0 ? (
        <ColorEmptyState onAddColor={handleAdd} />
      ) : (
        <ColorTable
          colors={colors}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Modals */}
      <ColorFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        color={selectedColor}
      />

      <DeleteColorDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        color={selectedColor}
      />
    </div>
  );
}
