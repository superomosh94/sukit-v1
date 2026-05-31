"use client";

export function CodeEditorPlaceholder({ siteId }: { siteId: string }) {
  return (
    <div className="flex items-center justify-center rounded-xl border-2 border-dashed bg-card p-16">
      <div className="text-center">
        <div className="text-4xl mb-4">&lt;/&gt;</div>
        <h3 className="text-lg font-semibold">Code Editor</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Full Monaco code editor integration coming soon.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Site ID: {siteId}
        </p>
      </div>
    </div>
  );
}
