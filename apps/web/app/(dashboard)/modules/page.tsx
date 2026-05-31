import Link from "next/link";

export default function ModulesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Modules</h1>
          <p className="text-sm text-muted-foreground">
            Installed modules and extensions
          </p>
        </div>
        <Link
          href="/modules/marketplace"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Browse Marketplace
        </Link>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-16">
        <p className="text-sm text-muted-foreground">
          No modules installed yet. Browse the marketplace to find modules.
        </p>
      </div>
    </div>
  );
}
