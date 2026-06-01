'use client';

import {
  Camera,
  MapPin,
  CircleSlash,
  Calendar,
  Monitor,
  GitFork,
} from 'lucide-react';

interface ExifPanelProps {
  metadata: Record<string, unknown> | null;
}

export function ExifPanel({ metadata }: ExifPanelProps) {
  if (!metadata || Object.keys(metadata).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Camera className="mb-2 size-8 text-muted-foreground/40" />
        <p className="text-xs text-muted-foreground">No EXIF data available</p>
      </div>
    );
  }

  const rows: { label: string; icon: typeof Camera; value: React.ReactNode }[] =
    [];

  if (metadata.make || metadata.model) {
    rows.push({
      label: 'Camera',
      icon: Camera,
      value: [metadata.make, metadata.model].filter(Boolean).join(' '),
    });
  }

  if (metadata.lens) {
    rows.push({
      label: 'Lens',
      icon: Camera,
      value: metadata.lens as string,
    });
  }

  if (metadata.focalLength) {
    rows.push({
      label: 'Focal Length',
      icon: Camera,
      value: `${metadata.focalLength}mm`,
    });
  }

  if (metadata.aperture) {
    rows.push({
      label: 'Aperture',
      icon: Camera,
      value: `f/${metadata.aperture}`,
    });
  }

  if (metadata.shutterSpeed) {
    rows.push({
      label: 'Shutter Speed',
      icon: Camera,
      value: `${metadata.shutterSpeed}s`,
    });
  }

  if (metadata.iso) {
    rows.push({
      label: 'ISO',
      icon: Camera,
      value: String(metadata.iso),
    });
  }

  if (metadata.whiteBalance) {
    rows.push({
      label: 'White Balance',
      icon: CircleSlash,
      value: metadata.whiteBalance as string,
    });
  }

  if (metadata.flash !== undefined && metadata.flash !== null) {
    rows.push({
      label: 'Flash',
      icon: Camera,
      value: metadata.flash ? 'Fired' : 'Did not fire',
    });
  }

  if (metadata.gpsLat && metadata.gpsLng) {
    const lat = Number(metadata.gpsLat);
    const lng = Number(metadata.gpsLng);
    rows.push({
      label: 'GPS Coordinates',
      icon: MapPin,
      value: (
        <a
          href={`https://www.google.com/maps?q=${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-primary hover:underline"
        >
          {lat.toFixed(4)}, {lng.toFixed(4)}
          <MapPin className="size-3" />
        </a>
      ),
    });
  }

  if (metadata.dateTaken) {
    rows.push({
      label: 'Date Taken',
      icon: Calendar,
      value: new Date(metadata.dateTaken as string).toLocaleString(),
    });
  }

  if (metadata.software) {
    rows.push({
      label: 'Software',
      icon: Monitor,
      value: metadata.software as string,
    });
  }

  if (metadata.orientation) {
    rows.push({
      label: 'Orientation',
      icon: GitFork,
      value: String(metadata.orientation),
    });
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Camera className="mb-2 size-8 text-muted-foreground/40" />
        <p className="text-xs text-muted-foreground">No EXIF data available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
      {rows.map((row) => (
        <div key={row.label} className="contents">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <row.icon className="size-3 shrink-0" />
            <span>{row.label}</span>
          </div>
          <div className="font-medium">{row.value}</div>
        </div>
      ))}
    </div>
  );
}
