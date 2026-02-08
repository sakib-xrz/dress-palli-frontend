"use client";

import { useCallback, useMemo, useState } from "react";
import { Check, ChevronsUpDown, Layers, Plus, Trash2 } from "lucide-react";

import { useSizes } from "@/hooks/use-sizes";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface VariantRow {
  id?: string;
  size_id: string | null;
  size_name: string;
  stock: number;
}

interface VariantSectionProps {
  variants: VariantRow[];
  onChange: (variants: VariantRow[]) => void;
  error?: string;
}

export function VariantSection({
  variants,
  onChange,
  error,
}: VariantSectionProps) {
  const { data: sizes } = useSizes();

  const [sizeOpen, setSizeOpen] = useState(false);
  const [bulkStock, setBulkStock] = useState("");

  const activeSizes = useMemo(
    () => sizes?.filter((s) => s.is_published && !s.is_deleted) ?? [],
    [sizes],
  );

  const selectedSizeIds = useMemo(() => {
    const ids = new Set<string>();
    variants.forEach((v) => {
      if (v.size_id) ids.add(v.size_id);
    });
    return ids;
  }, [variants]);

  const totalStock = useMemo(
    () => variants.reduce((sum, v) => sum + v.stock, 0),
    [variants],
  );

  const toggleSizeAndGenerate = useCallback(
    (sizeId: string) => {
      const size = activeSizes.find((s) => s.id === sizeId);
      if (!size) return;

      if (selectedSizeIds.has(sizeId)) {
        onChange(variants.filter((v) => v.size_id !== sizeId));
      } else {
        onChange([
          ...variants,
          { size_id: sizeId, size_name: size.name, stock: 0 },
        ]);
      }
    },
    [activeSizes, selectedSizeIds, variants, onChange],
  );

  const handleVariantChange = useCallback(
    (index: number, field: keyof VariantRow, value: unknown) => {
      const updated = [...variants];
      updated[index] = { ...updated[index], [field]: value };
      onChange(updated);
    },
    [variants, onChange],
  );

  const handleRemoveVariant = useCallback(
    (index: number) => {
      onChange(variants.filter((_, i) => i !== index));
    },
    [variants, onChange],
  );

  const handleAddCustomVariant = useCallback(() => {
    onChange([...variants, { size_id: null, size_name: "—", stock: 0 }]);
  }, [variants, onChange]);

  const handleBulkStock = useCallback(() => {
    const stock = parseInt(bulkStock);
    if (isNaN(stock) || stock < 0) return;
    onChange(variants.map((v) => ({ ...v, stock })));
    setBulkStock("");
  }, [bulkStock, variants, onChange]);

  return (
    <div className="space-y-3">
      {/* Size Picker */}
      <Popover open={sizeOpen} onOpenChange={setSizeOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              "w-full justify-between font-normal",
              error && "border-destructive",
            )}
          >
            {selectedSizeIds.size > 0
              ? `${selectedSizeIds.size} size(s) selected`
              : "Select sizes..."}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[--radix-popover-trigger-width] p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder="Search sizes..." />
            <CommandList>
              <CommandEmpty>No sizes found.</CommandEmpty>
              <CommandGroup>
                {activeSizes.map((size) => (
                  <CommandItem
                    key={size.id}
                    value={size.name}
                    onSelect={() => toggleSizeAndGenerate(size.id)}
                  >
                    {size.name}
                    <Check
                      className={cn(
                        "ml-auto",
                        selectedSizeIds.has(size.id)
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected size badges */}
      {selectedSizeIds.size > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {Array.from(selectedSizeIds).map((id) => {
            const size = activeSizes.find((s) => s.id === id);
            return (
              <Badge key={id} variant="secondary">
                {size?.name}
              </Badge>
            );
          })}
        </div>
      )}

      {/* Variant rows */}
      {variants.length > 0 && (
        <div className="space-y-1.5">
          {/* Bulk fill */}
          <div className="group flex items-center gap-2 rounded-md border border-dashed bg-muted/40 px-2.5 py-1.5">
            <Layers className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="text-xs text-muted-foreground shrink-0">
              Set all stock to
            </span>
            <Input
              type="number"
              min={0}
              placeholder="0"
              value={bulkStock}
              onChange={(e) => setBulkStock(e.target.value)}
              className="h-7 w-16 text-xs bg-background"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-7 text-xs"
              onClick={handleBulkStock}
              disabled={!bulkStock}
            >
              Apply
            </Button>
          </div>

          {/* Rows */}
          {variants.map((variant, index) => (
            <div
              key={index}
              className="group flex items-center gap-2 rounded-md border px-2.5 py-1.5"
            >
              <span className="text-sm font-medium truncate min-w-0 flex-1">
                {variant.size_name}
              </span>
              <Input
                type="number"
                min={0}
                step="1"
                value={variant.stock || ""}
                onChange={(e) =>
                  handleVariantChange(
                    index,
                    "stock",
                    parseInt(e.target.value) || 0,
                  )
                }
                placeholder="0"
                className="h-7 w-16 text-xs"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => handleRemoveVariant(index)}
                className="shrink-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddCustomVariant}
        >
          <Plus className="size-3.5" />
          Custom Variant
        </Button>
        {variants.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {variants.length} variant{variants.length !== 1 ? "s" : ""} &middot;{" "}
            {totalStock} stock
          </span>
        )}
      </div>

      {/* Error */}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
