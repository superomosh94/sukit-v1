import React from 'react';

export interface ToggleButtonProps {
  label: string;
  icon?: React.ReactNode;
  pressed: boolean;
  onPressedChange: () => void;
  className?: string;
}

export function ToggleButton({
  label,
  icon,
  pressed,
  onPressedChange,
  className,
}: ToggleButtonProps) {
  return (
    <button
      onClick={onPressedChange}
      className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded-md transition-colors ${
        pressed
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground hover:bg-accent/50'
      } ${className || ''}`}
      aria-pressed={pressed}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export interface ToggleBarProps {
  toggles: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    pressed: boolean;
    onChange: () => void;
  }>;
}

export function ToggleBar({ toggles }: ToggleBarProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-md">
      {toggles.map((t) => (
        <ToggleButton
          key={t.id}
          label={t.label}
          icon={t.icon}
          pressed={t.pressed}
          onPressedChange={t.onChange}
        />
      ))}
    </div>
  );
}
