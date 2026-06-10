"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const sun = <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>;
const moon = <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>;
const check = <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>;

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
  if (!mounted) return <div className="h-9 w-9" />;
  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-all hover:bg-accent/10 hover:text-foreground active:scale-[0.95]" aria-label="Toggle theme">
      {theme === "dark" ? sun : moon}
    </button>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="my-4 overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border last:border-0 transition-colors hover:bg-muted/20">
              {row.map((cell, j) => (
                <td key={j} className={`px-4 py-3 ${j === 0 ? "font-medium text-foreground" : "text-muted-foreground"}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HrLine() {
  return <div className="relative my-12"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div></div>;
}

function MonoQuote({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 overflow-x-auto rounded-xl bg-muted/40">
      <div className="flex items-center gap-1.5 border-b border-border/50 px-4 py-2">
        <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
        <div className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
        <span className="ml-2 text-[10px] font-medium text-muted-foreground/50">terminal</span>
      </div>
      <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-foreground/80"><code>{children}</code></pre>
    </div>
  );
}

export default function ManifestoPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <img src="/sukit-logo.svg" alt="SUKIT" className="h-9 w-auto" />
            <span className="text-sm font-medium text-muted-foreground">/ Manifesto</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Back to Home</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <motion.div className="mb-16 text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <motion.div
            className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <motion.span className="flex h-2 w-2 rounded-full bg-success" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
            CEO & Lead Developer
          </motion.div>
          <motion.h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
            The Sukit Manifesto
          </motion.h1>
          <motion.p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.25 }}>
            If I were the CEO and Lead Developer of Derivo Labs, here is what I would say.
          </motion.p>
          <motion.div className="mt-8 text-sm text-muted-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.35 }}>
            <span className="font-medium text-foreground">Moe (@devMoe)</span> <span className="mx-2 text-muted-foreground/40">&mdash;</span> Build <span className="mx-1.5 text-muted-foreground/30">&middot;</span> Export <span className="mx-1.5 text-muted-foreground/30">&middot;</span> Own
          </motion.div>
        </motion.div>

        <div className="space-y-8">
          <Section title="The One Sentence">
            <p className="text-xl font-medium leading-relaxed text-foreground">
              <strong className="text-primary">Sukit is the only platform that lets you visually build websites, add M-Pesa in one click, and export standalone code</strong> <span className="text-muted-foreground">&mdash; so you never pay a monthly fee and you never lose ownership of your work.</span>
            </p>
          </Section>

          <HrLine />

          <Section title="The Problem Sukit Solves">
            <Subsection title='The Lie of "No-Code"'>
              <p>Every no-code platform makes the same promise: &ldquo;Build without developers.&rdquo; But the truth is:</p>
              <Table headers={["Platform", "Reality"]} rows={[
                ["Webflow", "You pay $30-200/month forever. Stop paying? Site dies."],
                ["Wix/Squarespace", "You don't own your code. You can't leave."],
                ["WordPress", "Free, but hosting, security, plugins cost you time."],
                ["Freelancers", "70% disappear after deposit. No accountability."],
                ["Custom dev", "2-3 months and 500,000 KSh for a basic site."],
              ]} />
              <Highlight>The user is trapped. Sukit frees them.</Highlight>
            </Subsection>

            <Subsection title="The Kenyan Problem">
              <p>Kenya runs on M-Pesa. 90% of online transactions are mobile money.</p>
               <p>Yet almost every website builder assumes you use Stripe or PayPal. Kenyan businesses lose 30-50% of potential sales because customers can&apos;t pay the way they want.</p>
              <Highlight>Sukit solves this. M-Pesa is not an add-on. M-Pesa is the default.</Highlight>
            </Subsection>

            <Subsection title="The Agency Problem">
              <p>Digital agencies in Kenya outsource to freelancers who disappear, deliver late, or write terrible code. The agency takes the blame.</p>
              <Highlight>Sukit gives agencies a white-label platform they control. They sell. Sukit builds. No freelancer risk.</Highlight>
            </Subsection>

            <Subsection title="The Developer Problem">
              <p>Every developer rebuilds the same features for every project:</p>
              <div className="my-4 flex flex-wrap gap-2">
                {["Authentication", "Media upload", "Forms", "Payments", "Admin dashboard"].map((f) => (
                  <span key={f} className="inline-flex items-center gap-1.5 rounded-md bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground ring-1 ring-border">
                    {check}
                    {f}
                  </span>
                ))}
              </div>
              <p className="mt-4">That&apos;s weeks of work. Every. Single. Time.</p>
              <Highlight>Sukit has 30 pre-built modules. Copy. Paste. Customize. Ship in days, not weeks.</Highlight>
            </Subsection>
          </Section>

          <HrLine />

          <Section title="The Sukit Solution">
            <Subsection title="What Sukit Is">
              <Table headers={["Layer", "What It Does"]} rows={[
                ["Visual Builder", "Drag-drop 37 block types. No code needed."],
                ["30 Modules", "M-Pesa, Media, Forms, SEO, Blog, Commerce, etc."],
                ["Export Pipeline", "Generates standalone React + Express code."],
                ["White-Label", "Agencies rebrand everything. Clients see their brand."],
                ["M-Pesa Native", "Daraja API integrated. STK Push works out of the box."],
              ]} />
            </Subsection>

            <Subsection title="What Sukit Is NOT">
              <Table headers={["Misconception", "Reality"]} rows={[
                ["Another no-code platform", "No — you can export code and leave anytime"],
                ["A hosting service", "No — clients host their own sites"],
                ["A template reseller", "No — every site is custom-coded"],
                ["WordPress on steroids", "No — modern stack (Next.js, Express, PostgreSQL)"],
              ]} />
            </Subsection>

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center text-lg font-medium text-primary">
              <strong>Build once. Export. Own forever.</strong> No monthly fee. No vendor lock-in. No hidden costs.
            </div>
          </Section>

          <HrLine />

          <Section title='The Master Idea: Sukit is a "Platform Factory"'>
            <p>Most tools are <strong>products</strong> &mdash; you use them, they own your output.</p>
            <p>Sukit is a <strong>platform factory</strong> &mdash; you use it to build websites, then you export those websites as completely independent applications.</p>
            <MonoQuote>{`Traditional SaaS:
  You build -> Platform hosts -> You pay monthly -> Never own

  Sukit:
  You build -> Export code -> Client hosts -> Client owns
               |
               No monthly fee. No lock-in. Freedom.`}</MonoQuote>
          </Section>

          <HrLine />

          <Section title="The Three Pillars of Sukit">
            <div className="grid gap-5">
              <Pillar number="1" title="Visual Building (No Code Required)">
                <p>Anyone can build a professional website with drag-and-drop blocks. No coding required. 37 block types, 3 custom editors, responsive preview.</p>
              </Pillar>
              <Pillar number="2" title="M-Pesa Native (Kenyan First)">
                <p>One click to add M-Pesa payments. STK Push. Callbacks. Transaction logging. Reconciliation. All built in.</p>
              </Pillar>
              <Pillar number="3" title="Export to Standalone Code (No Lock-In)">
                <MonoQuote>{`sukit export --site=acme-safaris --output=./acme-site

  # Output:
  # - Vite + React frontend
  # - Express + Prisma backend
  # - PostgreSQL schema
  # - Docker compose
  # - Deployment instructions`}</MonoQuote>
                <p className="mt-4">The client owns everything. No monthly fee. No platform risk.</p>
              </Pillar>
            </div>
          </Section>

          <HrLine />

          <Section title="The Business Model">
            <Table headers={["Revenue Stream", "Model", "Target"]} rows={[
              ["Sukit Cloud", "Monthly subscription", "Freelancers, small agencies"],
              ["Sukit Self-Hosted", "One-time license", "Enterprises, large agencies"],
              ["White-Label Resale", "Monthly agency license", "Agencies reselling to clients"],
              ["Module Marketplace", "30% revenue share", "Third-party developers"],
              ["Custom Development", "Project-based", "Enterprise clients"],
            ]} />
          </Section>

          <HrLine />

          <Section title="The Competitive Moat">
            <Table headers={["Competitor", "Sukit Advantage"]} rows={[
              ["Webflow", "No M-Pesa, no code export -> Sukit gives both"],
              ["Wix/Squarespace", "No code ownership -> Sukit gives full ownership"],
              ["WordPress", "Bloated, insecure, PHP -> Sukit modern stack"],
              ["Freelancers", "Unreliable -> Sukit agency-grade reliability"],
              ["Custom dev", "10x slower -> Sukit modules = 10x faster"],
            ]} />
            <Highlight>The moat is M-Pesa + code export + 30 modules + white-label. No one else offers this combination.</Highlight>
          </Section>

          <HrLine />

          <Section title="The Vision (12 Months)">
            <Table headers={["Quarter", "Goal"]} rows={[
              ["Q1", "10 paying customers, refine export pipeline"],
              ["Q2", "Launch module marketplace with third-party modules"],
              ["Q3", "Enterprise self-hosted version, compliance certifications"],
              ["Q4", "Expand to other African markets (Airtel Money, MTN MoMo)"],
            ]} />
          </Section>

          <HrLine />

          <Section title="The Manifesto">
            <div className="rounded-xl border border-border bg-card p-8 text-lg leading-relaxed">
              <p className="mb-6 text-xl font-semibold text-foreground">&ldquo;We are not building another website builder.</p>
              <p className="mb-4">We are building the <strong className="text-primary">escape hatch</strong> from vendor lock-in.</p>
              <p className="mb-4">Every SaaS company traps their users. Monthly fees. Code ownership. Data export fees. Take it or leave it.</p>
              <p className="mb-4 font-medium text-foreground">Sukit is different.</p>
              <p className="mb-4">You build with us because we make you faster. You leave because we give you your code. You come back because we earned your trust.</p>
              <p className="mb-4">M-Pesa is not a checkbox. M-Pesa is the reason Kenyan businesses choose us over Webflow.</p>
              <p className="mb-4">Export is not a feature. Export is the promise that you will never be trapped.</p>
              <p className="text-xl font-semibold text-foreground">Sukit is not a product. Sukit is a <span className="text-primary">platform for freedom</span>.&rdquo;</p>
            </div>
          </Section>

          <HrLine />

          <Section title="The Final Word">
            <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-success/5 p-8 text-center">
              <p className="mb-6 text-2xl font-bold tracking-tight text-foreground">Build <span className="mx-2 text-muted-foreground/30">&middot;</span> Export <span className="mx-2 text-muted-foreground/30">&middot;</span> Own</p>
              <p className="mx-auto max-w-lg text-muted-foreground">You have a business to run, clients to serve, and products to ship. Sukit is here to make all of that faster, cheaper, and more reliable.</p>
              <p className="mx-auto mt-4 max-w-lg text-muted-foreground">Stop rebuilding authentication, media libraries, payment systems, and admin dashboards for every project.</p>
              <p className="mt-6 text-lg font-semibold text-foreground">You are ready. Sukit is ready. Now go.</p>
              <p className="mt-6 border-t border-primary/10 pt-6 text-sm text-muted-foreground">
                <em>Moe (@devMoe) &mdash; CEO & Lead Developer, Derivo Labs</em>
              </p>
            </div>
          </Section>
        </div>
      </main>

      <footer className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-3xl px-6 py-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Derivo Labs. Build &middot; Export &middot; Own.
        </div>
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.section initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.4 }}>
      <h2 className="relative mb-6 inline-block text-2xl font-bold tracking-tight sm:text-3xl">
        {title}
        <span className="absolute -bottom-2 left-0 h-1 w-12 rounded-full bg-gradient-to-r from-primary to-success" />
      </h2>
      <div className="mt-5 space-y-4 leading-relaxed text-muted-foreground">{children}</div>
    </motion.section>
  );
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8 space-y-3">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Highlight({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`my-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-medium leading-relaxed text-primary ${className || ""}`}>
      {children}
    </div>
  );
}

function Pillar({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div className="group rounded-xl border border-border bg-card/80 p-6 transition-all hover:border-primary/20 hover:shadow-md">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary transition-colors group-hover:bg-primary/15">
          {number}
        </span>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="leading-relaxed text-muted-foreground">{children}</div>
    </div>
  );
}
