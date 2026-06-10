"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

function IconBox({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary ${className || ""}`}>
      {children}
    </div>
  );
}

function Badge({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium ${color === "primary" ? "border-primary/20 bg-primary/5 text-primary" : "border-border bg-muted/50 text-muted-foreground"}`}>
      {children}
    </span>
  );
}

function SectionTitle({ id, title, subtitle }: { id?: string; title: string; subtitle?: string }) {
  return (
    <div id={id} className="mx-auto max-w-2xl text-center">
      <h2 className="relative inline-block text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
        <span className="absolute -bottom-2 left-1/2 h-1 w-16 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-success" />
      </h2>
      {subtitle && <p className="mt-6 text-base leading-relaxed text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

const icons = {
  layout: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>,
  code: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>,
  database: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>,
  globe: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>,
  package: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>,
  zap: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
  users: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  shield: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  cpu: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" /></svg>,
  terminal: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></svg>,
  blocks: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
  arrowRight: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
  check: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  sun: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>,
  moon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>,
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.25, 0.1, 0.25, 1] } as const,
  }),
} as any;

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
};

const cardHover = {
  rest: { y: 0, transition: { duration: 0.2 } },
  hover: { y: -4, transition: { duration: 0.2 } },
};

type GradientTheme = {
  from: string;
  via: string;
  to: string;
};

const sectionThemes: Record<string, GradientTheme> = {
  hero: { from: "hsl(var(--primary) / 0.15)", via: "hsl(var(--info) / 0.08)", to: "hsl(var(--success) / 0.05)" },
  stats: { from: "hsl(var(--primary) / 0.08)", via: "hsl(var(--background))", to: "hsl(var(--primary) / 0.04)" },
  builder: { from: "hsl(var(--primary) / 0.12)", via: "hsl(var(--info) / 0.06)", to: "hsl(var(--background))" },
  sdk: { from: "hsl(var(--primary) / 0.1)", via: "hsl(var(--success) / 0.06)", to: "hsl(var(--background))" },
  architecture: { from: "hsl(var(--warning) / 0.1)", via: "hsl(var(--primary) / 0.06)", to: "hsl(var(--background))" },
  stack: { from: "hsl(var(--success) / 0.1)", via: "hsl(var(--info) / 0.06)", to: "hsl(var(--background))" },
  modules: { from: "hsl(var(--info) / 0.1)", via: "hsl(var(--primary) / 0.06)", to: "hsl(var(--background))" },
  export: { from: "hsl(var(--primary) / 0.12)", via: "hsl(var(--success) / 0.06)", to: "hsl(var(--background))" },
  collab: { from: "hsl(var(--success) / 0.1)", via: "hsl(var(--primary) / 0.05)", to: "hsl(var(--background))" },
  database: { from: "hsl(var(--info) / 0.1)", via: "hsl(var(--primary) / 0.05)", to: "hsl(var(--background))" },
  quickstart: { from: "hsl(var(--primary) / 0.1)", via: "hsl(var(--info) / 0.05)", to: "hsl(var(--background))" },
  cta: { from: "hsl(var(--primary) / 0.15)", via: "hsl(var(--success) / 0.08)", to: "hsl(var(--background))" },
};

function useMouseGradient(sectionKey: string) {
  const sectionRef = useRef<HTMLElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  const handleMouse = useCallback((e: MouseEvent) => {
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const theme = sectionThemes[sectionKey] || sectionThemes.hero;
    setStyle({
      background: `radial-gradient(circle at ${x}% ${y}%, ${theme.from}, ${theme.via} 40%, ${theme.to} 70%)`,
    });
  }, [sectionKey]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const theme = sectionThemes[sectionKey] || sectionThemes.hero;
    setStyle({
      background: `radial-gradient(circle at 50% 50%, ${theme.from}, ${theme.via} 40%, ${theme.to} 70%)`,
    });
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, [handleMouse, sectionKey]);

  return sectionRef;
}

function Section({ id, sectionKey, className, children }: { id?: string; sectionKey: string; className?: string; children: React.ReactNode }) {
  const ref = useMouseGradient(sectionKey);
  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={fadeIn}
      className={`relative border-b border-border transition-[background] duration-75 ${className || ""}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/0 via-background/0 to-background/40" />
      <div className="relative mx-auto max-w-7xl px-6 py-24">
        {children}
      </div>
    </motion.section>
  );
}

type Ripple = { x: number; y: number; id: number };
let rippleId = 0;

export default function LandingPage() {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === "A" || t.tagName === "BUTTON" || t.closest("a") || t.closest("button")) {
        const id = ++rippleId;
        setRipples((prev) => [...prev, { x: e.clientX, y: e.clientY, id }]);
        setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.div
            key={r.id}
            initial={{ scale: 0, opacity: 0.7 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="pointer-events-none fixed z-[9999] h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary"
            style={{ left: r.x, top: r.y }}
          />
        ))}
      </AnimatePresence>
      <Header />
      <main>
        <HeroSection />
        <StatsSection />
        <BuilderSection />
        <SdkSection />
        <ArchitectureSection />
        <TechStackSection />
        <ModulesSection />
        <ExportSection />
        <CollabSection />
        <DatabaseSection />
        <QuickStartSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isRendered = useRef(false);

  useEffect(() => {
    if (!isRendered.current) {
      isRendered.current = true;
      setMounted(true);
    }
  }, []);

  if (!mounted) {
    return <div className="h-9 w-9" />;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-all hover:bg-accent/10 hover:text-foreground active:scale-[0.95]"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? icons.sun : icons.moon}
    </button>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center">
          <img src="/sukit-logo.svg" alt="SUKIT" className="h-12 w-auto" />
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="#builder" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Builder</Link>
          <Link href="#modules" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Modules</Link>
          <Link href="#architecture" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Architecture</Link>
          <Link href="#stack" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Stack</Link>
          <Link href="#export" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Export</Link>
          <Link href="#quickstart" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Quick Start</Link>
          <a href="/docs" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Docs</a>
          <a href="/manifesto" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Manifesto</a>
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Sign In</Link>
          <Link href="/register" className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary-hover active:scale-[0.97]">Get Started</Link>
        </div>
    </div>
    </header>
  );
}

function FloatingShape({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      className={`pointer-events-none absolute ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: [0, -8, 0] }}
      transition={{ duration: 4, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="h-12 w-12 rounded-2xl border border-border bg-card/50 backdrop-blur-sm" />
    </motion.div>
  );
}

const barWidths: Record<number, number[]> = {
  0: [45, 62, 38, 55],
  1: [70, 48, 52, 65, 42],
  2: [58, 35, 50, 45, 62],
};

function FloatingCode({ className, delay = 0, lines }: { className: string; delay?: number; lines: number }) {
  const widths = barWidths[delay]?.slice(0, lines) ?? [45, 55, 50];

  return (
    <motion.div
      className={`pointer-events-none absolute ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 5, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="space-y-1.5 rounded-xl border border-border/50 bg-card/40 p-3 backdrop-blur-sm">
        {widths.map((w, i) => (
          <div key={i} className="h-1.5 rounded-full bg-foreground/10" style={{ width: `${w}px` }} />
        ))}
      </div>
    </motion.div>
  );
}

function HeroSection() {
  return (
    <Section sectionKey="hero" className="relative min-h-[90vh] overflow-hidden pt-20 sm:pt-28">
      {/* Background image */}
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat opacity-100"
        style={{ backgroundImage: "url('/hero-bg.svg')" }}
      />

      {/* Animated gradient orbs */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-primary/5 blur-xl" />
      <div className="pointer-events-none absolute -right-24 top-1/3 h-56 w-56 rounded-full bg-info/4 blur-xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-success/4 blur-xl" />

      {/* Floating decorative elements */}
      <FloatingCode className="left-[8%] top-[20%] hidden lg:block" delay={0} lines={3} />
      <FloatingCode className="right-[10%] top-[15%] hidden lg:block" delay={1.5} lines={4} />
      <FloatingShape className="left-[12%] top-[55%] hidden lg:block" delay={0.8} />
      <FloatingShape className="right-[8%] top-[50%] hidden lg:block" delay={2} />

      <div className="relative mx-auto max-w-5xl px-6 pt-12 sm:pt-16">
        {/* Animated badge */}
        <motion.div
          className="mx-auto flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.span
            className="flex h-2 w-2 rounded-full bg-success"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-xs font-medium text-primary">Internal Developer Tool</span>
        </motion.div>

        {/* Main headline with staggered animation */}
        <motion.h1
          className="mx-auto mt-10 max-w-4xl text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <span className="block">Build Websites Visually.</span>
          <span className="mt-2 block bg-gradient-to-r from-primary via-info to-success bg-clip-text text-transparent">
            Own the Code.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Developer-first visual website builder with 30 built-in modules, M-Pesa payments, and one-click export to
          standalone React + Express apps.
        </motion.p>

        {/* Feature pills */}
        <motion.div
          className="mt-8 flex flex-wrap justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {["No lock-in", "M-Pesa native", "30 modules", "Code export"].map((f) => (
            <span key={f} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/30 px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
              {f}
            </span>
          ))}
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          className="mt-10 flex items-center justify-center gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/25 active:scale-[0.97]"
          >
            Start Building
            <motion.span
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowIcon />
            </motion.span>
          </Link>
          <Link
            href="#builder"
            className="group inline-flex items-center gap-2 rounded-lg border border-border bg-background/80 px-8 py-3 text-sm font-medium backdrop-blur-sm transition-all hover:bg-accent/10 active:scale-[0.97]"
          >
            Explore the Builder
            <ArrowIcon />
          </Link>
        </motion.div>

        {/* Bottom stats bar */}
        <motion.div
          className="mx-auto mt-20 grid max-w-2xl grid-cols-3 gap-8 border-t border-border/50 pt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {[
            ["30+", "Pre-built Modules"],
            ["150+", "API Routes"],
            ["100%", "Code Ownership"],
          ].map(([value, label]) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-bold tracking-tight text-foreground">{value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </Section>
  );
}

function StatsSection() {
  const stats = [
    { value: "202,580", label: "Lines of TypeScript", icon: icons.code },
    { value: "1,938", label: "TypeScript Files", icon: icons.terminal },
    { value: "60+", label: "Database Models", icon: icons.database },
    { value: "48+", label: "Page Routes", icon: icons.globe },
  ];

  return (
    <Section sectionKey="stats" className="!py-12">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="group flex items-center gap-4 rounded-xl border border-border bg-card/80 p-5 transition-all hover:border-primary/20 hover:shadow-sm">
            <IconBox className="transition-colors group-hover:bg-primary/15">{s.icon}</IconBox>
            <div>
              <div className="text-2xl font-bold tracking-tight text-foreground">{s.value}</div>
              <div className="mt-0.5 text-sm text-muted-foreground">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function BuilderSection() {
  const features = [
    { title: "Drag-and-Drop Canvas", desc: "Powered by @dnd-kit. Sections and blocks sortable vertically with alignment snapping, drag overlays, and resize handles.", icon: icons.layout },
    { title: "36+ Block Types", desc: "Container, Section, Row, Column, Grid, Stack, Heading, Paragraph, Image, Gallery, Video, Form, Button, Accordion, Carousel, Pricing, FAQ, Map, and more.", icon: icons.blocks },
    { title: "Property Panel", desc: "Contextual editor for styles, props, animations, responsive overrides, and custom CSS per block. Changes update in real time.", icon: icons.cpu },
    { title: "Responsive Preview", desc: "Switch between desktop, tablet, and phone viewports with custom breakpoints. Grid snapping and alignment guides for pixel-perfect layouts.", icon: icons.globe },
    { title: "Undo / Redo", desc: "Snapshot-based history stack with 50 snapshots. Clipboard support for cut, copy, and paste across sections and blocks.", icon: icons.zap },
    { title: "State Persistence", desc: "Zustand store with localStorage persistence. Save/load page templates, named version snapshots, auto-recovery on refresh.", icon: icons.database },
  ];

  return (
    <Section id="builder" sectionKey="builder">
      <SectionTitle title="Visual Builder" subtitle="18,353 lines of TypeScript powering a three-column drag-drop page builder with real-time collaboration." />
      <motion.div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }}>
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              custom={i}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group rounded-xl border border-border bg-card/80 p-6 transition-all hover:border-primary/20 hover:shadow-md"
            >
            <IconBox className="transition-colors group-hover:bg-primary/15">{f.icon}</IconBox>
            <h3 className="mt-4 font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
          </motion.div>
          ))}
        </motion.div>
    </Section>
  );
}

function SdkSection() {
  return (
    <Section sectionKey="sdk">
      <SectionTitle title="Module SDK" subtitle="Every module follows a standard contract: a manifest, an activate function, and a deactivate function." />
      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card/80 p-6 transition-all hover:border-primary/20 hover:shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <IconBox>{icons.package}</IconBox>
            <h3 className="font-semibold">Module Contract</h3>
          </div>
          <div className="overflow-x-auto rounded-lg bg-muted/50">
            <div className="flex items-center gap-1.5 border-b border-border/50 px-4 py-2">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
              <span className="ml-2 text-[10px] font-medium text-muted-foreground/50">module.ts</span>
            </div>
            <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-foreground/80"><code>{`interface Module {
  manifest: ModuleManifest;
  activate(kernel: KernelForModule): Promise<void>;
  deactivate(kernel: KernelForModule): Promise<void>;
}

async function activate(kernel) {
  kernel.api.post('/api/mpesa/stkpush', ...);
  kernel.blocks.register({ type: 'mpesaButton' });
  kernel.settings.registerPanel({ id: 'mpesa' });
  kernel.events.on('page:beforeSave', ...);
}`}</code></pre>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card/80 p-6 transition-all hover:border-primary/20 hover:shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <IconBox>{icons.shield}</IconBox>
            <h3 className="font-semibold">Kernel API Surface</h3>
          </div>
          <div className="overflow-x-auto rounded-lg bg-muted/50">
            <div className="flex items-center gap-1.5 border-b border-border/50 px-4 py-2">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
              <span className="ml-2 text-[10px] font-medium text-muted-foreground/50">kernel.ts</span>
            </div>
            <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-foreground/80"><code>{`interface SukitKernel {
  modules, events, auth, permissions,
  fs, storage, sites, pages, blocks,
  media, export, api, ui, settings,
  tasks, cache, log,
  forModule(id): SukitKernel
}

kernel.forModule('mpesa')
  .settings.get('consumerKey')
kernel.events.on('page:beforeSave', ...)`}</code></pre>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-2xl rounded-xl border border-primary/20 bg-primary/5 p-5 text-sm text-muted-foreground">
        <strong className="text-primary">Scoped Kernel:</strong> Every module gets its own settings, storage, and log
        namespace via <code className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">kernel.forModule(moduleId)</code>.
      </div>
    </Section>
  );
}

function ArchitectureSection() {
  const layers: { name: string; items: string; color: string }[] = [
    { name: "Enterprise OS", items: "SSO, SAML, billing, compliance, API gateway", color: "from-red-500/20 to-red-600/10" },
    { name: "Production Infra", items: "Security, monitoring, CI/CD, Docker/K8s", color: "from-orange-500/20 to-orange-600/10" },
    { name: "Tools Layer", items: "CLI, webhooks, WebSocket, search engine", color: "from-amber-500/20 to-amber-600/10" },
    { name: "Marketplace", items: "150+ API endpoints, module registry, dev portal", color: "from-yellow-500/20 to-yellow-600/10" },
    { name: "30 Modules", items: "M-Pesa, Blog, Commerce, Analytics, Chat, SEO, Forms...", color: "from-lime-500/20 to-lime-600/10" },
    { name: "36+ Block Types", items: "Heading, Image, Form, Video, Carousel, Pricing...", color: "from-emerald-500/20 to-emerald-600/10" },
    { name: "UI Layer", items: "Shell desktop, 48+ routes, 103+ components", color: "from-teal-500/20 to-teal-600/10" },
    { name: "Core Kernel", items: "DI, event bus, 16 API domains, permissions", color: "from-cyan-500/20 to-cyan-600/10" },
  ];

  return (
    <Section id="architecture" sectionKey="architecture">
      <div className="mx-auto max-w-2xl text-center">
        <SectionTitle title="8-Layer Architecture" subtitle="From kernel to enterprise, every layer is modular, testable, and independently deployable." />
        </div>
      <motion.div
        className="mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
      >
        {layers.map((layer, i) => (
          <motion.div
            key={layer.name}
            variants={fadeUp}
            custom={i}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="group relative overflow-hidden rounded-xl border border-border bg-card/80 p-5 transition-all hover:shadow-lg"
          >
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${layer.color} opacity-0 transition-opacity group-hover:opacity-100`} />
            <div className="relative">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">L{i + 1}</span>
                <h3 className="font-semibold">{layer.name}</h3>
              </div>
              <p className="text-xs text-muted-foreground">{layer.items}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}

function TechStackSection() {
  const stacks = [
    { category: "Frontend", icon: icons.code, items: [
      { name: "Next.js 16", desc: "App router, server components, Turbopack" },
      { name: "React 19", desc: "Server actions, use() hook, concurrent features" },
      { name: "Tailwind CSS v4", desc: "CSS-first config, @theme directives" },
      { name: "shadcn/ui / Radix", desc: "Accessible primitives, unstyled components" },
      { name: "Zustand", desc: "Builder state with localStorage persistence" },
      { name: "@dnd-kit", desc: "Drag-and-drop canvas with sortable context" },
    ] },
    { category: "Backend", icon: icons.terminal, items: [
      { name: "Express.js", desc: "REST API, middleware, health checks" },
      { name: "Socket.IO", desc: "Real-time collaboration, presence, cursors" },
      { name: "BullMQ", desc: "Background job queues (export, email, webhook)" },
      { name: "Prisma ORM", desc: "60+ models, PostgreSQL, migrations" },
      { name: "NextAuth v5", desc: "JWT sessions, credentials, OAuth providers" },
      { name: "Winston", desc: "Structured logging, multiple transports" },
    ] },
    { category: "Infrastructure", icon: icons.shield, items: [
      { name: "PostgreSQL", desc: "Primary database via Prisma ORM" },
      { name: "Redis", desc: "Caching, queues, Socket.IO adapter (optional)" },
      { name: "pnpm", desc: "Workspace monorepo with Turborepo" },
      { name: "Docker", desc: "Optional containerization for production" },
      { name: "PM2", desc: "Process management for production deployments" },
      { name: "S3 / R2", desc: "Configurable file storage for media uploads" },
    ] },
    { category: "Payments & AI", icon: icons.zap, items: [
      { name: "M-Pesa (Daraja)", desc: "STK Push, B2C, callbacks, query, reversal" },
      { name: "Stripe", desc: "Card payments, subscriptions (module coming)" },
      { name: "OpenAI", desc: "AI chat module, GPT-4 Turbo integration" },
      { name: "Resend", desc: "Email delivery for newsletters, auth emails" },
      { name: "Ollama", desc: "Local AI models for self-hosted chat" },
      { name: "UploadThing", desc: "File uploads for forms and media" },
    ] },
  ];

  return (
    <Section id="stack" sectionKey="stack">
      <SectionTitle title="Technology Stack" subtitle="Modern, type-safe, and production-ready across every layer of the platform." />
      <motion.div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }}>
        {stacks.map((group, i) => (
          <motion.div
            key={group.category}
            variants={fadeUp}
            custom={i}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group rounded-xl border border-border bg-card/80 p-6 transition-all hover:border-primary/20 hover:shadow-md"
          >
            <div className="mb-5 flex items-center gap-3">
              <IconBox className="transition-colors group-hover:bg-primary/15">{group.icon}</IconBox>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">{group.category}</h3>
            </div>
            <div className="space-y-3">
              {group.items.map((item) => (
                <div key={item.name} className="rounded-lg border border-border/50 bg-muted/20 px-3.5 py-2.5 transition-colors hover:border-primary/20 hover:bg-primary/[0.02]">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{item.name}</span>
                    <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary/5 text-[10px] text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      {icons.check}
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{item.desc}</div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}

const SvgIcon = ({ path }: { path: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: path }} />
);

const modIcons = {
  mpesa: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>',
  media: '<path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>',
  builder: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
  form: '<path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>',
  analytics: '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>',
  seo: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  popup: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/>',
  commerce: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
  site: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  export: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  blog: '<path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>',
  membership: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  booking: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  events: '<path d="M8 2v4"/><path d="M16 2v4"/><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/>',
  newsletter: '<polyline points="4 4 12 12 20 4"/><path d="M2 8v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8"/><path d="M22 4H2a2 2 0 0 0-2 2v1l12 8 12-8V6a2 2 0 0 0-2-2z"/>',
  reviews: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  translation: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>',
  cookie: '<path d="M21 12a9 9 0 1 1-9-9c.83 0 1.5.67 1.5 1.5 0 .83.67 1.5 1.5 1.5s1.5.67 1.5 1.5c0 .83.67 1.5 1.5 1.5s1.5.67 1.5 1.5c0 .83.67 1.5 1.5 1.5 0 .83.67 1.5 1.5 1.5z"/><circle cx="9" cy="9" r="1"/><circle cx="14" cy="14" r="1"/><circle cx="9" cy="14" r="1"/><circle cx="14" cy="9" r="1"/>',
  webhooks: '<path d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4z"/><line x1="12" y1="17" x2="12" y2="17"/>',
  pricing: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  testimonials: '<path d="M3 21c3 0 7-1 7-8V5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h2v4c0 1.1.9 2 2 2"/><path d="M21 21c3 0 7-1 7-8V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h2v4c0 1.1.9 2 2 2"/>',
  countdown: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  redirect: '<path d="M18 8h-2V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h3v3c0 1.1.9 2 2 2h9c1.1 0 2-.9 2-2v-9c0-1.1-.9-2-2-2z"/><path d="M21 3h-6l3 3-3 3h6V3z"/>',
  custom: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  social: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
  faq: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  auth: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  stripe: '<rect x="2" y="4" width="20" height="16" rx="3"/><line x1="12" y1="9" x2="12" y2="15"/><line x1="9" y1="12" x2="15" y2="12"/>',
};

const modules: { name: string; desc: string; icon: string }[] = [
  { name: "M-Pesa Payments", desc: "Daraja API, STK Push, B2C, callbacks, auto-reconciliation", icon: modIcons.mpesa },
  { name: "Media Library", desc: "10K+ lines -- upload, crop, WebP, folders, tags, S3/R2", icon: modIcons.media },
  { name: "Visual Builder", desc: "18K+ lines -- drag-drop canvas, 36+ blocks, property panel", icon: modIcons.builder },
  { name: "Form Builder", desc: "Conditional logic, file uploads, email integrations", icon: modIcons.form },
  { name: "Analytics", desc: "Page views, events, custom dashboards, export reports", icon: modIcons.analytics },
  { name: "SEO Module", desc: "Meta editor, JSON-LD schema, sitemap, analysis", icon: modIcons.seo },
  { name: "Code Editor", desc: "Monaco editor, file tree, git panel, terminal", icon: modIcons.code },
  { name: "AI Chat", desc: "OpenAI/Ollama, training config, lead capture", icon: modIcons.chat },
  { name: "Popup Builder", desc: "Triggers, animations, targeting, A/B testing", icon: modIcons.popup },
  { name: "Commerce", desc: "Products, variants, cart, checkout, orders, inventory", icon: modIcons.commerce },
  { name: "Site Manager", desc: "Multi-site, page tree, team roles, trash", icon: modIcons.site },
  { name: "Export Engine", desc: "7K+ lines -- Vite+React+Express code generator", icon: modIcons.export },
  { name: "Blog", desc: "Posts, categories, tags, comments, revisions, RSS", icon: modIcons.blog },
  { name: "Membership", desc: "Plans, subscriptions, member directory", icon: modIcons.membership },
  { name: "Booking", desc: "Calendar, staff, time slots, services", icon: modIcons.booking },
  { name: "Events", desc: "Ticketing, QR check-in, agenda, speakers", icon: modIcons.events },
  { name: "Newsletter", desc: "Campaigns, subscribers, templates, analytics", icon: modIcons.newsletter },
  { name: "Reviews", desc: "Star ratings, pros/cons, image attachments", icon: modIcons.reviews },
  { name: "Translation", desc: "Multi-language editor, auto-detect", icon: modIcons.translation },
  { name: "Cookie Consent", desc: "GDPR/CCPA compliant banner, preferences", icon: modIcons.cookie },
  { name: "Webhooks", desc: "15+ integrations, retry logic, logs", icon: modIcons.webhooks },
  { name: "Pricing Table", desc: "Visual tiers, feature comparison, CTAs", icon: modIcons.pricing },
  { name: "Testimonials", desc: "Carousel, grid, moderation dashboard", icon: modIcons.testimonials },
  { name: "Countdown", desc: "Timers, evergreen mode, completion actions", icon: modIcons.countdown },
  { name: "Redirect Manager", desc: "URL redirects, pattern matching, logs", icon: modIcons.redirect },
  { name: "Custom Code", desc: "HTML/CSS/JS injection, header/footer scripts", icon: modIcons.custom },
  { name: "Social Feed", desc: "Instagram/Facebook feed, auto-update", icon: modIcons.social },
  { name: "FAQ", desc: "Accordion, categories, search, rich answers", icon: modIcons.faq },
  { name: "Auth Module", desc: "Login, register, password reset, MFA", icon: modIcons.auth },
  { name: "Stripe (Coming)", desc: "Credit card payments, subscriptions", icon: modIcons.stripe },
];

function ModulesSection() {
  return (
    <Section id="modules" sectionKey="modules">
      <div className="mx-auto max-w-2xl text-center">
        <span className="mb-4 inline-block rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">30 Modules</span>
        <SectionTitle title="Everything You Need, Built-In" subtitle="Every module follows the Module SDK. Drag-and-drop activation, no config files, zero conflicts." />
        </div>
      <motion.div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }}>
        {modules.map((mod, i) => (
          <motion.div
            key={mod.name}
            variants={fadeUp}
            custom={i}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="group rounded-xl border border-border bg-card/80 p-4 transition-all hover:border-primary/30 hover:shadow-sm"
          >
            <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-md bg-primary/5 text-primary group-hover:bg-primary/10">
              <SvgIcon path={mod.icon} />
            </div>
            <h3 className="font-semibold">{mod.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{mod.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}

function TerminalHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1.5 border-b border-border/50 px-4 py-2">
      <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
      <div className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
      <span className="ml-2 text-[10px] font-medium text-muted-foreground/50">{label}</span>
    </div>
  );
}

function ExportSection() {
  return (
    <Section id="export" sectionKey="export">
      <SectionTitle title="Export Standalone Code" subtitle="One click generates a complete, production-ready application. The client deploys anywhere and owns everything." />
      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card/80 p-6 transition-all hover:border-primary/20 hover:shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">F</div>
            <h3 className="font-semibold">Frontend &mdash; Vite + React 19 + Tailwind</h3>
          </div>
          <div className="overflow-x-auto rounded-lg bg-muted/50">
            <TerminalHeader label="frontend/" />
            <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-foreground/80"><code>{`acme-site/
  frontend/
    src/
      pages/          # React.lazy() code splitting
      components/     # Block components per type
      api/            # Auto-generated client
    tailwind.config.js
    package.json`}</code></pre>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card/80 p-6 transition-all hover:border-primary/20 hover:shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-sm font-bold text-success">B</div>
            <h3 className="font-semibold">Backend &mdash; Express + Prisma + PostgreSQL</h3>
          </div>
          <div className="overflow-x-auto rounded-lg bg-muted/50">
            <TerminalHeader label="backend/" />
            <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-foreground/80"><code>{`acme-site/
  backend/
    src/
      routes/         # API routes
      controllers/    # Business logic
      prisma/         # DB schema
    docker-compose.yml
    .env.template
    package.json`}</code></pre>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { title: "Static Export", desc: "Generates HTML/CSS/JS for any static host" },
          { title: "GitHub Push", desc: "Exports directly to a GitHub repository" },
          { title: "Full-Stack Archive", desc: "Produces a zip with everything needed" },
        ].map((item) => (
          <div key={item.title} className="group rounded-xl border border-border bg-card/80 p-5 text-center transition-all hover:border-primary/20 hover:shadow-sm">
            <div className="mb-1 text-lg font-semibold text-primary">{item.title}</div>
            <p className="text-xs text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function CollabSection() {
  return (
    <Section sectionKey="collab">
      <SectionTitle title="Real-Time Collaboration" subtitle="Socket.IO-powered multiplayer editing with presence, cursors, and scene synchronization." />
      <motion.div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }}>
        {[
          { title: "Live Cursors", desc: "See where other users are pointing in real time" },
          { title: "Scene Sync", desc: "Full page state synchronized across all clients" },
          { title: "Block Locking", desc: "Prevent conflicts with per-block edit locks" },
          { title: "Presence Tracking", desc: "Know who is viewing each page and section" },
        ].map((item, i) => (
          <motion.div key={item.title} variants={fadeUp} custom={i} whileHover={{ y: -4, transition: { duration: 0.2 } }} className="group rounded-xl border border-border bg-card/80 p-5 transition-all hover:border-primary/20 hover:shadow-md">
            <IconBox className="transition-colors group-hover:bg-primary/15">{icons.users}</IconBox>
            <h3 className="mt-3 font-semibold">{item.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}

function DatabaseSection() {
  const groups = [
    { title: "Core", models: ["User", "Site", "Page", "Section", "Column", "Block", "Media", "Form"] },
    { title: "Content", models: ["Post", "Comment", "Taxonomy", "Term", "Theme", "WidgetArea", "Popup"] },
    { title: "Commerce", models: ["Product", "Variant", "Cart", "Order", "MpesaTransaction"] },
    { title: "System", models: ["Backup", "Deployment", "Webhook", "CronJob", "AuditLog", "TrashItem"] },
  ];

  return (
    <Section sectionKey="database">
      <SectionTitle title="Database Schema" subtitle="60+ Prisma models across 2,127 lines. PostgreSQL with migrations, indexes, and cascading relations." />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {groups.map((group) => (
          <div key={group.title} className="group rounded-xl border border-border bg-card/80 p-5 transition-all hover:border-primary/20 hover:shadow-sm">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{group.title}</h3>
            <div className="flex flex-wrap gap-2">
              {group.models.map((m) => (
                <span key={m} className="inline-flex items-center gap-1.5 rounded-md bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary ring-1 ring-primary/10">
                  {icons.check}
                  {m}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function QuickStartSection() {
  const steps = [
    { title: "Clone &amp; Install", code: "git clone <repo>\npnpm install\ncp .env.example .env" },
    { title: "Start Database", code: "# PostgreSQL on localhost:5432\n# Or: free Supabase instance\n# Update DATABASE_URL in .env" },
    { title: "Push Schema &amp; Seed", code: "pnpm db:push\npnpm db:seed\ndemo@sukit.dev / demo1234" },
    { title: "Run Dev Server", code: "pnpm dev:watch\n# Web:  localhost:3000\n# API:  localhost:3001/health" },
  ];

  return (
    <Section id="quickstart" sectionKey="quickstart">
      <SectionTitle title="Quick Start" subtitle="From zero to running in under five minutes. No Docker required." />
      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {steps.map((step, i) => (
          <div key={step.title} className="group rounded-xl border border-border bg-card/80 p-6 transition-all hover:border-primary/20 hover:shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary transition-colors group-hover:bg-primary/15">{i + 1}</span>
              <h3 className="font-semibold" dangerouslySetInnerHTML={{ __html: step.title }} />
            </div>
            <div className="overflow-x-auto rounded-lg bg-muted/50">
              <TerminalHeader label="terminal" />
              <pre className="overflow-x-auto p-3 text-xs leading-relaxed text-foreground/80"><code>{step.code}</code></pre>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function CtaSection() {
  return (
    <Section sectionKey="cta">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Start Building</h2>
        <p className="mt-4 text-muted-foreground">Full access to the visual builder, all 30 modules, and the export pipeline.</p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/25 active:scale-[0.97]"
          >
            Get Started
            <motion.span
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {icons.arrowRight}
            </motion.span>
          </Link>
        </div>
      </div>
    </Section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <img src="/sukit-logo.svg" alt="SUKIT" className="h-10 w-auto" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Developer-first visual website builder. Build visually, export real code.</p>
          </div>
          {[
            { title: "Product", links: ["Modules", "Documentation", "API Reference", "CLI Guide"] },
            { title: "Resources", links: ["Architecture", "Tech Stack", "Quick Start", "Database Schema"] },
            { title: "Company", links: ["About", "Blog", "GitHub", "Changelog"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-sm font-semibold">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">{link}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t border-border pt-6 text-center text-sm text-muted-foreground">&copy; {new Date().getFullYear()} SUKIT. All rights reserved.</div>
      </div>
    </footer>
  );
}
