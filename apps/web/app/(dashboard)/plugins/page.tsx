import Link from "next/link";

export default function PluginsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Plugins</h1>
          <p className="text-sm text-muted-foreground">
            Manage installed plugins and extensions
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/plugins/add"
            className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            Add Plugin
          </Link>
          <Link
            href="/plugins/create"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Create Plugin
          </Link>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-16">
        <p className="text-sm text-muted-foreground">
          No plugins installed. Browse the registry or create your own.
        </p>
      </div>
    </div>
  );
}
