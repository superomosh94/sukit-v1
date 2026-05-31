"use client";

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team</h1>
          <p className="text-sm text-muted-foreground">
            Manage your team members and permissions
          </p>
        </div>
        <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
          Invite Member
        </button>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-semibold mb-4">Members (1)</h2>
        <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
            Y
          </div>
          <div>
            <p className="text-sm font-medium">You (Owner)</p>
            <p className="text-xs text-muted-foreground">demo@sukit.dev</p>
          </div>
        </div>
      </div>
    </div>
  );
}
