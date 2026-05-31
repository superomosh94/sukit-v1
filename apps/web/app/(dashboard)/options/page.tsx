export default function OptionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Options</h1>
        <p className="text-sm text-muted-foreground">Global site settings and configuration</p>
      </div>
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Site Title</label>
          <input type="text" className="block w-full rounded-lg border bg-background px-3 py-2 text-sm" placeholder="My SUKIT Site" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tagline</label>
          <input type="text" className="block w-full rounded-lg border bg-background px-3 py-2 text-sm" placeholder="Just another SUKIT site" />
        </div>
        <button className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Save Settings</button>
      </div>
    </div>
  );
}
