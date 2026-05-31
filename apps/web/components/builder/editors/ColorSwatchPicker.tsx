"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { SettingsSection, SettingsField } from "./shared";
import { cn } from "@/lib/utils/cn";

const PREDEFINED_COLORS = [
  { hex: "#000000", name: "Black" },
  { hex: "#ffffff", name: "White" },
  { hex: "#0f172a", name: "Slate 900" },
  { hex: "#1e293b", name: "Slate 800" },
  { hex: "#334155", name: "Slate 700" },
  { hex: "#475569", name: "Slate 600" },
  { hex: "#64748b", name: "Slate 500" },
  { hex: "#94a3b8", name: "Slate 400" },
  { hex: "#cbd5e1", name: "Slate 300" },
  { hex: "#e2e8f0", name: "Slate 200" },
  { hex: "#f1f5f9", name: "Slate 100" },
  { hex: "#f8fafc", name: "Slate 50" },
  { hex: "#ef4444", name: "Red 500" },
  { hex: "#f97316", name: "Orange 500" },
  { hex: "#eab308", name: "Yellow 500" },
  { hex: "#22c55e", name: "Green 500" },
  { hex: "#06b6d4", name: "Cyan 500" },
  { hex: "#3b82f6", name: "Blue 500" },
  { hex: "#6366f1", name: "Indigo 500" },
  { hex: "#a855f7", name: "Purple 500" },
  { hex: "#ec4899", name: "Pink 500" },
];

export function ColorSwatchPicker({
  value,
  onChange,
  label = "Color",
}: {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}) {
  const [customHex, setCustomHex] = useState(value);

  const handleCustomChange = useCallback(
    (hex: string) => {
      setCustomHex(hex);
      onChange(hex);
    },
    [onChange],
  );

  return (
    <div className="space-y-3">
      <SettingsSection title={label}>
        <div className="flex items-center gap-2">
          <Input
            type="color"
            value={value}
            onChange={(e) => handleCustomChange(e.target.value)}
            className="h-8 w-10"
          />
          <Input
            value={customHex}
            onChange={(e) => handleCustomChange(e.target.value)}
            className="h-8 flex-1 text-xs font-mono"
            placeholder="#000000"
          />
        </div>
      </SettingsSection>

      <div className="grid grid-cols-7 gap-1.5">
        {PREDEFINED_COLORS.map((c) => (
          <button
            key={c.hex}
            type="button"
            title={c.name}
            onClick={() => handleCustomChange(c.hex)}
            className={cn(
              "h-6 w-full rounded-md border border-border transition-transform hover:scale-110",
              value.toLowerCase() === c.hex.toLowerCase() &&
                "ring-2 ring-primary ring-offset-1",
            )}
            style={{ backgroundColor: c.hex }}
          />
        ))}
      </div>

      <SettingsField label="Opacity">
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={0}
          className="w-full"
        />
      </SettingsField>
    </div>
  );
}
