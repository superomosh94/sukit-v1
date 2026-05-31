import Link from "next/link";

export default function AddPluginPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add Plugin</h1>
        <p className="text-sm text-muted-foreground">
          Install a plugin from the registry or a package name
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <label htmlFor="plugin-name" className="block text-sm font-medium mb-2">
          Plugin Name or NPM Package
        </label>
        <div className="flex gap-2">
          <input
            id="plugin-name"
            type="text"
            placeholder="e.g. sukit-plugin-seo"
            className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm"
          />
          <button className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            Install
          </button>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-semibold mb-2">Popular Plugins</h2>
        <div className="text-sm text-muted-foreground">
          <Link href="/plugins/registry" className="text-primary hover:underline">
            Browse the plugin registry
          </Link>{" "}
          to discover available plugins.
        </div>
      </div>
    </div>
  );
}
