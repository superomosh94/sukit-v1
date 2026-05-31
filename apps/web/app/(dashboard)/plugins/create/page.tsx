"use client";

import { useState } from "react";

export default function CreatePluginPage() {
  const [name, setName] = useState("");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create Plugin</h1>
        <p className="text-sm text-muted-foreground">
          Scaffold a new SUKIT plugin from a template
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div>
          <label htmlFor="plugin-name" className="block text-sm font-medium mb-1">
            Plugin Name
          </label>
          <input
            id="plugin-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="my-awesome-plugin"
            className="block w-full rounded-lg border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="template" className="block text-sm font-medium mb-1">
            Template
          </label>
          <select
            id="template"
            className="block w-full rounded-lg border bg-background px-3 py-2 text-sm"
          >
            <option value="basic">Basic Plugin</option>
            <option value="full">Full Plugin (with UI + API)</option>
            <option value="block">Block Plugin</option>
          </select>
        </div>

        <button
          disabled={!name.trim()}
          className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          Generate Plugin
        </button>
      </div>
    </div>
  );
}
