import Link from "next/link";


export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-cover bg-center text-gray-100 relative" style={{ backgroundImage: "url('/landing-bg.png')" }}>
      {/* Header with logo */}
      <header className="border-b border-gray-700 bg-gray-800/70 backdrop-blur-sm">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="SUKIT logo" width={40} height={40} className="inline-block"/>
            <span className="text-2xl font-extrabold text-indigo-400">SUKIT</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:underline">
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-gray-100 hover:bg-indigo-500"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="mx-auto max-w-4xl px-6 py-20 text-center bg-cover bg-center" style={{ backgroundImage: "url('/hero.png')" }}>
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-50 sm:text-6xl">
            Build Beautiful Websites
            <br />
            <span className="text-indigo-400">For Developers</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300">
            Drag‑and‑drop website builder with powerful blocks, custom code, and instant export. No coding required.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-full bg-indigo-600 px-8 py-3 text-sm font-medium text-gray-100 hover:bg-indigo-500"
            >
              Start Building Free
            </Link>
            <Link
              href="#features"
              className="rounded-full border border-gray-600 px-8 py-3 text-sm font-medium text-gray-300 hover:bg-gray-700"
            >
              Learn More
            </Link>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-t border-gray-700 bg-gray-800/50 py-24">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="text-center text-3xl font-bold text-gray-100">Everything you need</h2>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="rounded-xl border border-gray-600 bg-gray-800 p-6 shadow-sm">
                  <div className="mb-4 text-4xl text-indigo-400">{feature.icon}</div>
                  <h3 className="font-semibold text-gray-100">{feature.title}</h3>
                  <p className="mt-2 text-sm text-gray-300">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-24 bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl shadow-lg">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="text-3xl font-bold text-gray-100">Kickstart your project</h2>
            <p className="mt-4 text-gray-300">Launch your first developer project instantly.</p>
            <Link href="/register" className="mt-8 inline-flex rounded-full bg-indigo-600 px-8 py-3 text-sm font-medium text-gray-100 hover:bg-indigo-500">
              Start Building Now
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-700 bg-gray-800/70 py-6">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} SUKIT. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: "🎨",
    title: "Drag & Drop Builder",
    description:
      "Intuitive visual editor with real-time preview. Just drag blocks and arrange them on your page.",
  },
  {
    icon: "🧩",
    title: "50+ Blocks",
    description:
      "Pre-built sections and blocks for any need: text, images, videos, forms, pricing tables, and more.",
  },
  {
    icon: "🎭",
    title: "Custom Themes",
    description:
      "Full control over colors, typography, spacing. Create your brand identity with ease.",
  },
  {
    icon: "📱",
    title: "Responsive Design",
    description:
      "Built for every screen. Preview and customize your site for desktop, tablet, and mobile.",
  },
  {
    icon: "🚀",
    title: "One-Click Export",
    description:
      "Export static HTML/CSS or deploy directly to GitHub Pages, Vercel, or Netlify.",
  },
  {
    icon: "🤖",
    title: "AI‑Powered",
    description:
      "Generate content, images, and layouts with built-in AI assistance.",
  },
];

