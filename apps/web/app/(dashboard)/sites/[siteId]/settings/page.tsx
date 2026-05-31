"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";

export default function SiteSettingsPage() {
  const params = useParams<{ siteId: string }>();
  const router = useRouter();
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/sites/${params.siteId}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          domain: { custom: domain },
        }),
      });

      if (!res.ok) throw new Error("Failed to save");
      router.refresh();
    } catch {
      // handled
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Site Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure your site name, domain, and branding.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Site Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-lg border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="domain" className="block text-sm font-medium">
            Custom Domain
          </label>
          <input
            id="domain"
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com"
            className="mt-1 block w-full rounded-lg border bg-background px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Leave empty to use the default subdomain.
          </p>
        </div>

        <fieldset className="rounded-lg border p-4">
          <legend className="text-sm font-medium px-1">Theme Colors</legend>
          <div className="mt-2 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground">
                Primary Color
              </label>
              <input
                type="color"
                className="mt-1 h-10 w-full rounded border"
                defaultValue="#0f172a"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground">
                Secondary Color
              </label>
              <input
                type="color"
                className="mt-1 h-10 w-full rounded border"
                defaultValue="#64748b"
              />
            </div>
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
