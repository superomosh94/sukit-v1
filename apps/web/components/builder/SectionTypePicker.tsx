"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useBuilderStore } from "@/lib/builder/store";
import {
  LayoutTemplate,
  Monitor,
  Images,
  User,
} from "lucide-react";

interface SectionTypeOption {
  type: string;
  icon: typeof LayoutTemplate;
  name: string;
  description: string;
}

const SECTION_TYPES: SectionTypeOption[] = [
  {
    type: "empty",
    icon: LayoutTemplate,
    name: "Empty Section",
    description: "Blank canvas to build from scratch",
  },
  {
    type: "cover",
    icon: Monitor,
    name: "Cover Section",
    description: "Full-viewport hero section with background",
  },
  {
    type: "parallax",
    icon: Images,
    name: "Parallax Section",
    description: "Multi-slide section with parallax effect",
  },
  {
    type: "custom",
    icon: User,
    name: "Custom Section",
    description: "Reusable section saved from your library",
  },
];

interface SectionTypePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SectionTypePicker({
  open,
  onOpenChange,
}: SectionTypePickerProps) {
  const addSection = useBuilderStore((s) => s.addSection);

  const handleSelect = (type: string) => {
    addSection(type);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Section</DialogTitle>
          <DialogDescription>
            Choose a section type to add to your page
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          {SECTION_TYPES.map((option) => {
            const Icon = option.icon;
            return (
              <Button
                key={option.type}
                variant="outline"
                className="flex h-auto flex-col items-center gap-3 p-6"
                onClick={() => handleSelect(option.type)}
              >
                <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-6" />
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium">{option.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {option.description}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
