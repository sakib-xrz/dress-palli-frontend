"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { useCategories } from "@/hooks/use-categories";
import type { Category } from "@/lib/type";

import { Button } from "@/components/ui/button";

import { CategoryTable } from "./_components/category-table";
import { CategoryTableSkeleton } from "./_components/category-table-skeleton";
import { CategoryEmptyState } from "./_components/category-empty-state";
import { CategoryFormModal } from "./_components/category-form-modal";
import { DeleteCategoryDialog } from "./_components/delete-category-dialog";

export default function CategoriesPage() {
  // ── State ──────────────────────────────────────────
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  // ── Data ───────────────────────────────────────────
  const { data: categories, isLoading } = useCategories();

  // ── Handlers ───────────────────────────────────────
  const handleAdd = () => {
    setSelectedCategory(null);
    setFormModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setFormModalOpen(true);
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  // ── Render ─────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
          <p className="text-sm text-muted-foreground">
            Manage your product categories and subcategories.
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus />
          Add Category
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <CategoryTableSkeleton />
      ) : !categories || categories.length === 0 ? (
        <CategoryEmptyState onAddCategory={handleAdd} />
      ) : (
        <CategoryTable
          categories={categories}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Modals */}
      <CategoryFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        category={selectedCategory}
      />

      <DeleteCategoryDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        category={selectedCategory}
      />
    </div>
  );
}
