"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { useFeaturedCategories } from "@/hooks/use-featured-categories";
import type { FeaturedCategory } from "@/lib/type";

import { Button } from "@/components/ui/button";

import { FeaturingTable } from "./_components/featuring-table";
import { FeaturingTableSkeleton } from "./_components/featuring-table-skeleton";
import { FeaturingEmptyState } from "./_components/featuring-empty-state";
import { FeaturingFormModal } from "./_components/featuring-form-modal";
import { DeleteFeaturingDialog } from "./_components/delete-featuring-dialog";

export default function FeaturingPage() {
  // ── State ──────────────────────────────────────────
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFeaturing, setSelectedFeaturing] =
    useState<FeaturedCategory | null>(null);

  // ── Data ───────────────────────────────────────────
  const { data: featuringList, isLoading } = useFeaturedCategories(true);

  // ── Handlers ───────────────────────────────────────
  const handleAdd = () => {
    setSelectedFeaturing(null);
    setFormModalOpen(true);
  };

  const handleEdit = (featuring: FeaturedCategory) => {
    setSelectedFeaturing(featuring);
    setFormModalOpen(true);
  };

  const handleDelete = (featuring: FeaturedCategory) => {
    setSelectedFeaturing(featuring);
    setDeleteDialogOpen(true);
  };

  // ── Render ─────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Featuring</h1>
          <p className="text-sm text-muted-foreground">
            Manage featured categories displayed on your homepage.
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus />
          Add Featured
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <FeaturingTableSkeleton />
      ) : !featuringList || featuringList.length === 0 ? (
        <FeaturingEmptyState onAddFeaturing={handleAdd} />
      ) : (
        <FeaturingTable
          featuringList={featuringList}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Modals */}
      <FeaturingFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        featuring={selectedFeaturing}
        existingFeaturedIds={
          featuringList?.map((f) => f.category_id) ?? []
        }
      />

      <DeleteFeaturingDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        featuring={selectedFeaturing}
      />
    </div>
  );
}
