"use client";

import { useCallback, useMemo, useState } from "react";
import { Check, ChevronsUpDown, Plus, Trash2 } from "lucide-react";

import { useColors } from "@/hooks/use-colors";
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
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface VariantRow {
  id?: string;
  color_id: string | null;
  size_id: string | null;
  color_name: string;
  size_name: string;
  price: number;
  stock: number;
  is_active: boolean;
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
  const { data: colors } = useColors();
  const { data: sizes } = useSizes();

  const [colorOpen, setColorOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkStock, setBulkStock] = useState("");

  const activeColors = useMemo(
    () => colors?.filter((c) => c.is_active) ?? [],
    [colors],
  );
  const activeSizes = useMemo(
    () => sizes?.filter((s) => s.is_active) ?? [],
    [sizes],
  );

  // Track selected color/size IDs derived from current variants
  const selectedColorIds = useMemo(() => {
    const ids = new Set<string>();
    variants.forEach((v) => {
      if (v.color_id) ids.add(v.color_id);
    });
    return ids;
  }, [variants]);

  const selectedSizeIds = useMemo(() => {
    const ids = new Set<string>();
    variants.forEach((v) => {
      if (v.size_id) ids.add(v.size_id);
    });
    return ids;
  }, [variants]);

  // Auto-generate matrix when color/size is toggled
  const toggleColorAndGenerate = useCallback(
    (colorId: string) => {
      const color = activeColors.find((c) => c.id === colorId);
      if (!color) return;

      if (selectedColorIds.has(colorId)) {
        // Remove all variants with this color
        onChange(variants.filter((v) => v.color_id !== colorId));
      } else {
        // Add new rows: this color x each selected size (or just this color if no sizes)
        const sizeIds = Array.from(selectedSizeIds);
        const newRows: VariantRow[] =
          sizeIds.length > 0
            ? sizeIds.map((sizeId) => {
                const size = activeSizes.find((s) => s.id === sizeId);
                return {
                  color_id: colorId,
                  size_id: sizeId,
                  color_name: color.name,
                  size_name: size?.name ?? "—",
                  price: 0,
                  stock: 0,
                  is_active: true,
                };
              })
            : [
                {
                  color_id: colorId,
                  size_id: null,
                  color_name: color.name,
                  size_name: "—",
                  price: 0,
                  stock: 0,
                  is_active: true,
                },
              ];
        onChange([...variants, ...newRows]);
      }
    },
    [
      activeColors,
      activeSizes,
      selectedColorIds,
      selectedSizeIds,
      variants,
      onChange,
    ],
  );

  const toggleSizeAndGenerate = useCallback(
    (sizeId: string) => {
      const size = activeSizes.find((s) => s.id === sizeId);
      if (!size) return;

      if (selectedSizeIds.has(sizeId)) {
        // Remove all variants with this size
        onChange(variants.filter((v) => v.size_id !== sizeId));
      } else {
        // Add new rows: each selected color x this size (or just this size if no colors)
        const colorIds = Array.from(selectedColorIds);
        const newRows: VariantRow[] =
          colorIds.length > 0
            ? colorIds.map((colorId) => {
                const color = activeColors.find((c) => c.id === colorId);
                return {
                  color_id: colorId,
                  size_id: sizeId,
                  color_name: color?.name ?? "—",
                  size_name: size.name,
                  price: 0,
                  stock: 0,
                  is_active: true,
                };
              })
            : [
                {
                  color_id: null,
                  size_id: sizeId,
                  color_name: "—",
                  size_name: size.name,
                  price: 0,
                  stock: 0,
                  is_active: true,
                },
              ];
        onChange([...variants, ...newRows]);
      }
    },
    [
      activeColors,
      activeSizes,
      selectedColorIds,
      selectedSizeIds,
      variants,
      onChange,
    ],
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
    onChange([
      ...variants,
      {
        color_id: null,
        size_id: null,
        color_name: "—",
        size_name: "—",
        price: 0,
        stock: 0,
        is_active: true,
      },
    ]);
  }, [variants, onChange]);

  const handleBulkPrice = useCallback(() => {
    const price = parseFloat(bulkPrice);
    if (isNaN(price) || price <= 0) return;
    onChange(variants.map((v) => ({ ...v, price })));
    setBulkPrice("");
  }, [bulkPrice, variants, onChange]);

  const handleBulkStock = useCallback(() => {
    const stock = parseInt(bulkStock);
    if (isNaN(stock) || stock < 0) return;
    onChange(variants.map((v) => ({ ...v, stock })));
    setBulkStock("");
  }, [bulkStock, variants, onChange]);

  return (
    <div className="space-y-5">
      {/* Selection Controls */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Color Picker */}
        <div className="space-y-2">
          <Label>Colors</Label>
          <Popover open={colorOpen} onOpenChange={setColorOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between font-normal"
              >
                {selectedColorIds.size > 0
                  ? `${selectedColorIds.size} color(s) selected`
                  : "Select colors..."}
                <ChevronsUpDown className="opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[--radix-popover-trigger-width] p-0"
              align="start"
            >
              <Command>
                <CommandInput placeholder="Search colors..." />
                <CommandList>
                  <CommandEmpty>No colors found.</CommandEmpty>
                  <CommandGroup>
                    {activeColors.map((color) => (
                      <CommandItem
                        key={color.id}
                        value={color.name}
                        onSelect={() => toggleColorAndGenerate(color.id)}
                      >
                        <div className="flex items-center gap-2">
                          {color.code && (
                            <span
                              className="size-3 rounded-full border shrink-0"
                              style={{ backgroundColor: color.code }}
                            />
                          )}
                          {color.name}
                        </div>
                        <Check
                          className={cn(
                            "ml-auto",
                            selectedColorIds.has(color.id)
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

          {/* Selected color badges */}
          {selectedColorIds.size > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {Array.from(selectedColorIds).map((id) => {
                const color = activeColors.find((c) => c.id === id);
                return (
                  <Badge key={id} className="gap-1">
                    {color?.code && (
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: color.code }}
                      />
                    )}
                    {color?.name}
                  </Badge>
                );
              })}
            </div>
          )}
        </div>

        {/* Size Picker */}
        <div className="space-y-2">
          <Label>Sizes</Label>
          <Popover open={sizeOpen} onOpenChange={setSizeOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between font-normal"
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
                return <Badge key={id}>{size?.name}</Badge>;
              })}
            </div>
          )}
        </div>
      </div>

      {/* Variants Table */}
      {variants.length > 0 && (
        <div className="rounded-lg border overflow-auto">
          <Table className="bg-background">
            <TableHeader>
              <TableRow>
                <TableHead>Color</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Price (BDT)</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-center">Active</TableHead>
                <TableHead className="w-10" />
              </TableRow>
              {/* Inline bulk fill row */}
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead
                  colSpan={2}
                  className="text-xs font-medium text-muted-foreground py-1.5"
                >
                  Fill all rows
                </TableHead>
                <TableHead className="py-1.5">
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="number"
                      placeholder="Price"
                      value={bulkPrice}
                      onChange={(e) => setBulkPrice(e.target.value)}
                      className="h-7 w-24 text-xs"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="xs"
                      onClick={handleBulkPrice}
                      disabled={!bulkPrice}
                    >
                      Set
                    </Button>
                  </div>
                </TableHead>
                <TableHead className="py-1.5">
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="number"
                      placeholder="Stock"
                      value={bulkStock}
                      onChange={(e) => setBulkStock(e.target.value)}
                      className="h-7 w-20 text-xs"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="xs"
                      onClick={handleBulkStock}
                      disabled={!bulkStock}
                    >
                      Set
                    </Button>
                  </div>
                </TableHead>
                <TableHead colSpan={2} className="py-1.5" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {variants.map((variant, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {variant.color_id && (
                        <span
                          className="size-3 rounded-full border shrink-0"
                          style={{
                            backgroundColor:
                              activeColors.find(
                                (c) => c.id === variant.color_id,
                              )?.code ?? undefined,
                          }}
                        />
                      )}
                      <span className="text-sm">{variant.color_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{variant.size_name}</span>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={variant.price || ""}
                      onChange={(e) =>
                        handleVariantChange(
                          index,
                          "price",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      placeholder="0"
                      className="h-8 w-28"
                    />
                  </TableCell>
                  <TableCell>
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
                      className="h-8 w-20"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      size="sm"
                      checked={variant.is_active}
                      onCheckedChange={(checked) =>
                        handleVariantChange(index, "is_active", checked)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleRemoveVariant(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddCustomVariant}
        >
          <Plus />
          Add Custom Variant
        </Button>
        {variants.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {variants.length} variant{variants.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Error */}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
