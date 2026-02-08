"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface InfoField {
  key: string;
  value: string;
}

interface InfoFieldsProps {
  fields: InfoField[];
  onChange: (fields: InfoField[]) => void;
}

export function InfoFields({ fields, onChange }: InfoFieldsProps) {
  const handleAdd = () => {
    onChange([...fields, { key: "", value: "" }]);
  };

  const handleRemove = (index: number) => {
    onChange(fields.filter((_, i) => i !== index));
  };

  const handleChange = (
    index: number,
    field: "key" | "value",
    value: string,
  ) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {fields.length > 0 && (
        <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
          <Label className="text-xs text-muted-foreground">Attribute</Label>
          <Label className="text-xs text-muted-foreground">Value</Label>
          <div className="w-8" />
        </div>
      )}

      {fields.map((field, index) => (
        <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
          <Input
            placeholder="e.g. Material"
            value={field.key}
            onChange={(e) => handleChange(index, "key", e.target.value)}
          />
          <Input
            placeholder="e.g. Cotton"
            value={field.value}
            onChange={(e) => handleChange(index, "value", e.target.value)}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => handleRemove(index)}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAdd}
        className="w-full"
      >
        <Plus />
        Add Attribute
      </Button>
    </div>
  );
}
