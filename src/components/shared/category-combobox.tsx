"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { useCategories } from "@/hooks/use-categories";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CategoryComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  invalid?: boolean;
  excludeIds?: string[];
}

export function CategoryCombobox({
  value,
  onValueChange,
  invalid,
  excludeIds = [],
}: CategoryComboboxProps) {
  const [open, setOpen] = useState(false);
  const { data: categories } = useCategories();

  // Flatten categories with parent → child hierarchy
  const flatCategories = useMemo(() => {
    if (!categories) return [];
    const items: {
      id: string;
      name: string;
      displayName: string;
      isChild: boolean;
      parentName?: string;
    }[] = [];
    for (const cat of categories) {
      if (!excludeIds.includes(cat.id)) {
        items.push({
          id: cat.id,
          name: cat.name,
          displayName: cat.name,
          isChild: false,
        });
      }
      if (cat.children) {
        for (const child of cat.children) {
          if (!excludeIds.includes(child.id)) {
            items.push({
              id: child.id,
              name: child.name,
              displayName: `${cat.name} › ${child.name}`,
              isChild: true,
              parentName: cat.name,
            });
          }
        }
      }
    }
    return items;
  }, [categories, excludeIds]);

  const selectedCategory = flatCategories.find((c) => c.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid}
          className={cn(
            "w-full justify-between font-normal bg-transparent!",
            !value && "text-muted-foreground",
          )}
        >
          {selectedCategory
            ? selectedCategory.displayName
            : "Search & select category..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-background" align="start">
        <Command>
          <CommandInput placeholder="Search categories..." />
          <CommandList>
            <CommandEmpty>No category found.</CommandEmpty>
            <CommandGroup>
              {flatCategories.map((cat) => (
                <CommandItem
                  key={cat.id}
                  value={`${cat.name} ${cat.parentName ?? ""}`.trim()}
                  onSelect={() => {
                    onValueChange(cat.id);
                    setOpen(false);
                  }}
                >
                  <span
                    className={cn(
                      "font-bold",
                      cat.isChild && "pl-4 font-normal",
                    )}
                  >
                    {cat.displayName}
                  </span>
                  <Check
                    className={cn(
                      "ml-auto",
                      value === cat.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
