"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";
import type { DatePreset } from "@/lib/type";
import { useState } from "react";

const presetLabels: Record<DatePreset, string> = {
  today: "Today",
  last_7_days: "Last 7 Days",
  last_30_days: "Last 30 Days",
  this_month: "This Month",
  last_month: "Last Month",
};

interface DateRangeSelectorProps {
  preset?: DatePreset;
  startDate?: string;
  endDate?: string;
  onPresetChange: (preset: DatePreset) => void;
  onCustomRangeChange: (startDate: string, endDate: string) => void;
  onClearCustomRange: () => void;
}

export function DateRangeSelector({
  preset,
  startDate,
  endDate,
  onPresetChange,
  onCustomRangeChange,
  onClearCustomRange,
}: DateRangeSelectorProps) {
  const [customStart, setCustomStart] = useState(startDate || "");
  const [customEnd, setCustomEnd] = useState(endDate || "");
  const [popoverOpen, setPopoverOpen] = useState(false);

  const isCustomRange = startDate && endDate && !preset;

  const handleApplyCustomRange = () => {
    if (customStart && customEnd) {
      onCustomRangeChange(customStart, customEnd);
      setPopoverOpen(false);
    }
  };

  const formatCustomRangeDisplay = () => {
    if (isCustomRange && startDate && endDate) {
      const start = new Date(startDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const end = new Date(endDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      return `${start} - ${end}`;
    }
    return null;
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={isCustomRange ? "" : preset || "last_30_days"}
        onValueChange={(value) => {
          onPresetChange(value as DatePreset);
          onClearCustomRange();
        }}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Select period">
            {isCustomRange
              ? formatCustomRangeDisplay()
              : presetLabels[preset || "last_30_days"]}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(presetLabels).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" title="Custom date range">
            <Calendar className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Custom Date Range</h4>
              <p className="text-sm text-muted-foreground">
                Select start and end dates
              </p>
            </div>
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                />
              </div>
              <Button
                onClick={handleApplyCustomRange}
                disabled={!customStart || !customEnd}
              >
                Apply Range
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
