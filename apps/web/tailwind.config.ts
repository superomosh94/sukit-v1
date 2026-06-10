import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./styles/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          hover: "hsl(var(--primary-hover))",
          soft: "hsl(var(--primary-soft))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          hover: "hsl(var(--success-hover))",
          soft: "hsl(var(--success-soft))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          hover: "hsl(var(--warning-hover))",
          soft: "hsl(var(--warning-soft))",
        },
        danger: {
          DEFAULT: "hsl(var(--danger))",
          hover: "hsl(var(--danger-hover))",
          soft: "hsl(var(--danger-soft))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          hover: "hsl(var(--info-hover))",
          soft: "hsl(var(--info-soft))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        interactive: {
          hover: "hsl(var(--interactive-hover))",
          selected: "hsl(var(--interactive-selected))",
          border: "hsl(var(--interactive-border))",
          muted: "hsl(var(--interactive-muted))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          border: "hsl(var(--sidebar-border))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          ring: "hsl(var(--sidebar-ring))",
        },
        builder: {
          canvas: "hsl(var(--builder-canvas))",
          "canvas-grid": "hsl(var(--builder-canvas-grid))",
          "block-selected": "hsl(var(--builder-block-selected))",
          "block-hover": "hsl(var(--builder-block-hover))",
          "block-drag-over": "hsl(var(--builder-block-drag-over))",
          "palette-bg": "hsl(var(--builder-palette-bg))",
          "palette-item-hover": "hsl(var(--builder-palette-item-hover))",
          "palette-category": "hsl(var(--builder-palette-category))",
          "property-bg": "hsl(var(--builder-property-bg))",
          "property-border": "hsl(var(--builder-property-border))",
          "property-label": "hsl(var(--builder-property-label))",
          "property-input-border": "hsl(var(--builder-property-input-border))",
          "property-input-focus": "hsl(var(--builder-property-input-focus))",
          "layer-bg": "hsl(var(--builder-layer-bg))",
          "layer-item-hover": "hsl(var(--builder-layer-item-hover))",
          "layer-item-selected": "hsl(var(--builder-layer-item-selected))",
          "layer-item-selected-border": "hsl(var(--builder-layer-item-selected-border))",
          "layer-depth-marker": "hsl(var(--builder-layer-depth-marker))",
          "device-desktop": "hsl(var(--builder-device-desktop))",
          "device-tablet": "hsl(var(--builder-device-tablet))",
          "device-mobile": "hsl(var(--builder-device-mobile))",
          "device-active-bg": "hsl(var(--builder-device-active-bg))",
          "history-available": "hsl(var(--builder-history-available))",
          "history-unavailable": "hsl(var(--builder-history-unavailable))",
          saved: "hsl(var(--builder-saved))",
          saving: "hsl(var(--builder-saving))",
          error: "hsl(var(--builder-error))",
          danger: "hsl(var(--builder-danger))",
          "danger-soft": "hsl(var(--builder-danger-soft))",
        },
        trend: {
          up: "hsl(var(--trend-up))",
          down: "hsl(var(--trend-down))",
          neutral: "hsl(var(--trend-neutral))",
        },
        module: {
          "card-bg": "hsl(var(--module-card-bg))",
          "card-border": "hsl(var(--module-card-border))",
          "card-hover": "hsl(var(--module-card-hover))",
          "active": "hsl(var(--module-active))",
          "inactive": "hsl(var(--module-inactive))",
          "error": "hsl(var(--module-error))",
          "update-available": "hsl(var(--module-update-available))",
          "icon-bg": "hsl(var(--module-icon-bg))",
          "icon": "hsl(var(--module-icon))",
        },
        marketplace: {
          "price-paid": "hsl(var(--marketplace-price-paid))",
          "price-free": "hsl(var(--marketplace-price-free))",
          "install": "hsl(var(--marketplace-install))",
          "installed": "hsl(var(--marketplace-installed))",
        },
        block: {
          "category": "hsl(var(--block-category))",
          "drag-over": "hsl(var(--block-drag-over))",
          "preview": "hsl(var(--block-preview))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        heading: ["var(--font-heading)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "builder-fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "builder-slide-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "builder-fade-in": "builder-fade-in 0.2s ease-out",
        "builder-slide-up": "builder-slide-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
