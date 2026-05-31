import Link from "next/link";

export default function PluginRegistryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Plugin Registry</h1>
        <p className="text-sm text-muted-foreground">
          Discover and install community plugins
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-16">
        <p className="text-sm text-muted-foreground mb-4">
          Registry server not yet connected.
        </p>
        <Link
          href="/settings/api-keys"
          className="text-sm text-primary hover:underline"
        >
          Configure registry connection in settings
        </Link>
      </div>
    </div>
  );
}
