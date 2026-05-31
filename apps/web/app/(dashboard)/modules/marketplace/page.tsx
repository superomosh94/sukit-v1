"use client";

import { useState } from "react";

interface MarketplaceModule {
  id: string;
  name: string;
  description: string;
  author: string;
  downloads: number;
  rating: number;
  price: number;
}

const PLACEHOLDER_MODULES: MarketplaceModule[] = [
  {
    id: "seo",
    name: "SEO Optimizer",
    description: "Advanced SEO tools including meta tags, sitemaps, and analytics",
    author: "SUKIT",
    downloads: 1200,
    rating: 4.5,
    price: 0,
  },
  {
    id: "ecommerce",
    name: "E-Commerce",
    description: "Full e-commerce solution with products, cart, and checkout",
    author: "SUKIT",
    downloads: 890,
    rating: 4.2,
    price: 29,
  },
  {
    id: "analytics",
    name: "Analytics Dashboard",
    description: "Visitor analytics with charts, heatmaps, and session recording",
    author: "SUKIT",
    downloads: 650,
    rating: 4.8,
    price: 0,
  },
  {
    id: "forms-pro",
    name: "Forms Pro",
    description: "Advanced form builder with conditional logic and file uploads",
    author: "SUKIT",
    downloads: 430,
    rating: 4.0,
    price: 9,
  },
];

export default function MarketplacePage() {
  const [query, setQuery] = useState("");

  const filtered = PLACEHOLDER_MODULES.filter(
    (m) =>
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.description.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Module Marketplace</h1>
        <p className="text-sm text-muted-foreground">
          Extend your site with powerful modules
        </p>
      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search modules..."
        className="block w-full max-w-md rounded-lg border bg-background px-3 py-2 text-sm"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((mod) => (
          <div
            key={mod.id}
            className="rounded-xl border bg-card p-6 transition-colors hover:border-primary/50"
          >
            <h3 className="font-semibold">{mod.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {mod.description}
            </p>
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>by {mod.author}</span>
              <span>★ {mod.rating}</span>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-medium">
                {mod.price === 0 ? "Free" : `$${mod.price}`}
              </span>
              <button className="rounded bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:opacity-90">
                Install
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
