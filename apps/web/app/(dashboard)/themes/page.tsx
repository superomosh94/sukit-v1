export default function ThemesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Themes</h1>
          <p className="text-sm text-muted-foreground">Manage site themes and appearance</p>
        </div>
        <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Install Theme</button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-6">
          <div className="h-32 rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 mb-3" />
          <h3 className="font-semibold">SUKIT Default</h3>
          <p className="text-sm text-muted-foreground">The default SUKIT theme</p>
          <span className="inline-block mt-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Active</span>
        </div>
      </div>
    </div>
  );
}
