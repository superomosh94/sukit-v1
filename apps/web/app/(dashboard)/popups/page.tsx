import Link from "next/link";

export default function PopupsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Popups</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage popup campaigns
          </p>
        </div>
        <Link
          href="/popups/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          New Popup
        </Link>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-16">
        <p className="text-sm text-muted-foreground">
          No popups yet. Create your first popup campaign.
        </p>
      </div>
    </div>
  );
}
