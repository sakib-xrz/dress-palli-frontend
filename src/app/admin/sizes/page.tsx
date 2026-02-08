"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { useSizes } from "@/hooks/use-sizes";
import type { Size } from "@/lib/type";

import { Button } from "@/components/ui/button";

import { SizeTable } from "./_components/size-table";
import { SizeTableSkeleton } from "./_components/size-table-skeleton";
import { SizeEmptyState } from "./_components/size-empty-state";
import { SizeFormModal } from "./_components/size-form-modal";
import { DeleteSizeDialog } from "./_components/delete-size-dialog";

export default function SizesPage() {
  // ── State ──────────────────────────────────────────
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);

  // ── Data ───────────────────────────────────────────
  const { data: sizes, isLoading } = useSizes();

  // ── Handlers ───────────────────────────────────────
  const handleAdd = () => {
    setSelectedSize(null);
    setFormModalOpen(true);
  };

  const handleEdit = (size: Size) => {
    setSelectedSize(size);
    setFormModalOpen(true);
  };

  const handleDelete = (size: Size) => {
    setSelectedSize(size);
    setDeleteDialogOpen(true);
  };

  // ── Render ─────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sizes</h1>
          <p className="text-sm text-muted-foreground">
            Manage your product sizes for variants.
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus />
          Add Size
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <SizeTableSkeleton />
      ) : !sizes || sizes.length === 0 ? (
        <SizeEmptyState onAddSize={handleAdd} />
      ) : (
        <SizeTable
          sizes={sizes}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Modals */}
      <SizeFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        size={selectedSize}
      />

      <DeleteSizeDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        size={selectedSize}
      />
    </div>
  );
}
