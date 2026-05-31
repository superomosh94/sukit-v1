'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { useBuilderStore } from '../stores/builderStore';
import { getSectionPresets, buildPresetSection } from '../section-presets';
import {
  LayoutTemplate,
  Monitor,
  Images,
  User,
  LayoutGrid,
  DollarSign,
  Mail,
  Copyright,
} from 'lucide-react';

const ICON_MAP: Record<string, typeof LayoutTemplate> = {
  Monitor,
  LayoutGrid,
  DollarSign,
  Mail,
  Copyright,
  Images,
  User,
  LayoutTemplate,
};

interface SectionTypeOption {
  type: string;
  icon: typeof LayoutTemplate;
  name: string;
  description: string;
  isPreset?: boolean;
}

const SECTION_TYPES: SectionTypeOption[] = [
  {
    type: 'empty',
    icon: LayoutTemplate,
    name: 'Empty Section',
    description: 'Blank canvas to build from scratch',
  },
  {
    type: 'cover',
    icon: Monitor,
    name: 'Cover Section',
    description: 'Full-viewport hero section with background',
  },
  {
    type: 'parallax',
    icon: Images,
    name: 'Parallax Section',
    description: 'Multi-slide section with parallax effect',
  },
  {
    type: 'custom',
    icon: User,
    name: 'Custom Section',
    description: 'Reusable section saved from your library',
  },
];

const presets = getSectionPresets();
const PRESET_OPTIONS: SectionTypeOption[] = presets.map((p) => ({
  type: p.type,
  icon: ICON_MAP[p.icon] ?? LayoutTemplate,
  name: p.label,
  description: p.description,
  isPreset: true,
}));

interface SectionTypePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SectionTypePicker({
  open,
  onOpenChange,
}: SectionTypePickerProps) {
  const addSection = useBuilderStore((s) => s.addSection);
  const sections = useBuilderStore((s) => s.sections);
  const setSections = useBuilderStore((s) => s.setSections);
  const [tab, setTab] = useState<'basic' | 'presets'>('presets');

  const handleSelect = (type: string) => {
    const preset = buildPresetSection(type);
    if (preset) {
      const section = {
        ...preset,
        id: crypto.randomUUID(),
        pageId: '',
        sortKey: '',
        columns: preset.columns.map((c) => ({
          ...c,
          id: crypto.randomUUID(),
          sectionId: '',
          blocks: c.blocks.map((b) => ({
            ...b,
            id: crypto.randomUUID(),
            sortKey: '',
          })),
        })),
      };
      section.columns.forEach((c) => (c.sectionId = section.id));
      setSections([...sections, section]);
    } else {
      addSection(type);
    }
    onOpenChange(false);
  };

  const options = tab === 'presets' ? PRESET_OPTIONS : SECTION_TYPES;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Add Section</DialogTitle>
          <DialogDescription>
            Choose a section type or pre-built preset to add to your page
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-1 rounded-md border border-input bg-muted p-1 mb-2">
          <button
            onClick={() => setTab('presets')}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              tab === 'presets'
                ? 'bg-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Pre-built Sections
          </button>
          <button
            onClick={() => setTab('basic')}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              tab === 'basic'
                ? 'bg-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Basic Types
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 py-2 max-h-[400px] overflow-y-auto">
          {options.map((option) => {
            const Icon = option.icon;
            return (
              <Button
                key={option.type}
                variant="outline"
                className="flex h-auto flex-col items-center gap-3 p-5"
                onClick={() => handleSelect(option.type)}
              >
                <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" />
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
