"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { useBanners } from "@/hooks/use-banners";
import type { Banner } from "@/lib/type";

import { Button } from "@/components/ui/button";

import { BannerTable } from "./_components/banner-table";
import { BannerTableSkeleton } from "./_components/banner-table-skeleton";
import { BannerEmptyState } from "./_components/banner-empty-state";
import { BannerFormModal } from "./_components/banner-form-modal";
import { DeleteBannerDialog } from "./_components/delete-banner-dialog";

export default function BannersPage() {
  // ── State ──────────────────────────────────────────
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);

  // ── Data ───────────────────────────────────────────
  const { data: banners, isLoading } = useBanners(true);

  // ── Handlers ───────────────────────────────────────
  const handleAdd = () => {
    setSelectedBanner(null);
    setFormModalOpen(true);
  };

  const handleEdit = (banner: Banner) => {
    setSelectedBanner(banner);
    setFormModalOpen(true);
  };

  const handleDelete = (banner: Banner) => {
    setSelectedBanner(banner);
    setDeleteDialogOpen(true);
  };

  // ── Render ─────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Banners</h1>
          <p className="text-sm text-muted-foreground">
            Manage your homepage banners and promotional slides.
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus />
          Add Banner
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <BannerTableSkeleton />
      ) : !banners || banners.length === 0 ? (
        <BannerEmptyState onAddBanner={handleAdd} />
      ) : (
        <BannerTable
          banners={banners}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Modals */}
      <BannerFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        banner={selectedBanner}
      />

      <DeleteBannerDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        banner={selectedBanner}
      />
    </div>
  );
}
