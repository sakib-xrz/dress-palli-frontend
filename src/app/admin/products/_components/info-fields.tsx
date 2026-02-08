"use client";

import { useCallback } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface InfoField {
  key: string;
  value: string;
}

interface InfoFieldsProps {
  fields: InfoField[];
  onChange: (fields: InfoField[]) => void;
}

const PRESET_SUGGESTIONS = [
  "Fabric",
  "Care Instructions",
  "Occasion",
  "Border",
  "Pallu",
  "Blouse Type",
  "Salwar Type",
  "Dupatta",
  "Weave",
  "Embroidery",
] as const;

export function InfoFields({ fields, onChange }: InfoFieldsProps) {
  const handleAdd = useCallback(
    (presetKey?: string) => {
      onChange([...fields, { key: presetKey ?? "", value: "" }]);
    },
    [fields, onChange],
  );

  const handleRemove = useCallback(
    (index: number) => {
      onChange(fields.filter((_, i) => i !== index));
    },
    [fields, onChange],
  );

  const handleChange = useCallback(
    (index: number, field: "key" | "value", value: string) => {
      const updated = [...fields];
      updated[index] = { ...updated[index], [field]: value };
      onChange(updated);
    },
    [fields, onChange],
  );

  const availablePresets = PRESET_SUGGESTIONS.filter(
    (preset) =>
      !fields.some((f) => f.key.toLowerCase() === preset.toLowerCase()),
  );

  return (
    <div className="space-y-3">
      {/* Preset chips */}
      {availablePresets.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {availablePresets.map((preset) => (
            <Badge
              key={preset}
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => handleAdd(preset)}
            >
              <Plus className="size-3" />
              {preset}
            </Badge>
          ))}
        </div>
      )}

      {/* Rows */}
      {fields.length > 0 && (
        <div className="space-y-1.5">
          {fields.map((field, index) => (
            <div
              key={index}
              className="group flex items-center gap-2 rounded-md border px-2.5 py-1.5"
            >
              <Input
                placeholder="Attribute"
                value={field.key}
                onChange={(e) => handleChange(index, "key", e.target.value)}
                className="bg-transparent border-0 shadow-none focus-visible:ring-1 h-7 text-xs"
              />
              <Input
                placeholder="Value"
                value={field.value}
                onChange={(e) => handleChange(index, "value", e.target.value)}
                className="bg-transparent border-0 shadow-none focus-visible:ring-1 h-7 text-xs"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => handleRemove(index)}
                className="shrink-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
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
          onClick={() => handleAdd()}
        >
          <Plus className="size-3.5" />
          Add Attribute
        </Button>
        {fields.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {fields.length} attribute{fields.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
}
