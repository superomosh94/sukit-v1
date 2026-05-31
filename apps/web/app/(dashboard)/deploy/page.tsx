import Link from "next/link";

export default function DeployPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Deploy</h1>
        <p className="text-sm text-muted-foreground">
          Deploy your sites to hosting providers
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { name: "Vercel", desc: "Deploy to Vercel with zero config", connected: false },
          { name: "Netlify", desc: "Continuous deployment from Git", connected: false },
          { name: "Cloudflare Pages", desc: "Edge-deployed static sites", connected: false },
        ].map((provider) => (
          <div key={provider.name} className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold">{provider.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{provider.desc}</p>
            <button className="mt-4 rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90">
              Connect
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Link
          href="/deploy/ci"
          className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          CI/CD Pipelines
        </Link>
        <Link
          href="/deploy/secrets"
          className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          Environment Secrets
        </Link>
      </div>
    </div>
  );
}
