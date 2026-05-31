'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Rocket,
  GitBranch,
  Key,
  ExternalLink,
  Check,
  RefreshCw,
  Globe,
  ChevronRight,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ProviderType {
  id: string;
  name: string;
  description: string;
  docs: string;
  connected: boolean;
  lastDeploy?: string;
}

interface DeployRecord {
  id: string;
  siteId: string;
  site?: { name: string };
  status: string;
  type: string;
  outputUrl?: string;
  error?: string;
  pages: number;
  assets: number;
  size: number;
  createdAt: string;
  completedAt?: string;
}

const PROVIDERS: ProviderType[] = [
  {
    id: 'vercel',
    name: 'Vercel',
    description:
      'Zero-config deployment from Git. Auto SSL, preview URLs, and serverless functions.',
    docs: 'https://vercel.com/docs',
    connected: false,
  },
  {
    id: 'netlify',
    name: 'Netlify',
    description:
      'Continuous deployment from Git with branch previews, form handling, and edge functions.',
    docs: 'https://netlify.com/docs',
    connected: false,
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare Pages',
    description:
      'Edge-deployed static sites with automatic HTTPS, DDoS protection, and Workers integration.',
    docs: 'https://pages.cloudflare.com',
    connected: false,
  },
  {
    id: 'github-pages',
    name: 'GitHub Pages',
    description: 'Free static site hosting directly from GitHub repositories.',
    docs: 'https://pages.github.com',
    connected: false,
  },
  {
    id: 'aws-s3',
    name: 'AWS S3 + CloudFront',
    description: 'Host on AWS S3 with CloudFront CDN.',
    docs: 'https://aws.amazon.com/s3',
    connected: false,
  },
  {
    id: 'docker',
    name: 'Docker / Self-Hosted',
    description:
      'Containerized deployment via Docker on your own infrastructure.',
    docs: 'https://docker.com',
    connected: false,
  },
];

export default function DeployPage() {
  const [deployments, setDeployments] = useState<DeployRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<ProviderType[]>(() => {
    const stored =
      typeof window !== 'undefined'
        ? localStorage.getItem('sukit-deploy-providers')
        : null;
    return stored ? JSON.parse(stored) : PROVIDERS;
  });

  const loadDeployments = async () => {
    try {
      const res = await fetch('/api/deploy');
      const data = await res.json();
      setDeployments(Array.isArray(data) ? data : []);
    } catch {
      setDeployments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeployments();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sukit-deploy-providers', JSON.stringify(providers));
    }
  }, [providers]);

  const toggleProvider = async (id: string) => {
    setProviders((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              connected: !p.connected,
              lastDeploy: !p.connected ? 'Just now' : undefined,
            }
          : p
      )
    );
  };

  const deleteDeployment = async (id: string) => {
    try {
      await fetch(`/api/deploy/${id}`, { method: 'DELETE' });
      setDeployments((prev) => prev.filter((d) => d.id !== id));
    } catch {}
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle2 className="size-4 text-green-500" />;
      case 'FAILED':
        return <AlertCircle className="size-4 text-red-500" />;
      case 'BUILDING':
      case 'PENDING':
        return <Loader2 className="size-4 animate-spin text-blue-500" />;
      default:
        return <Clock className="size-4 text-muted-foreground" />;
    }
  };

  const connectedCount = providers.filter((p) => p.connected).length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Deploy</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Deploy your sites to hosting providers
          </p>
        </div>
        <span className="flex items-center gap-1 text-sm text-muted-foreground">
          <CheckCircle2 className="size-4 text-green-500" />
          {connectedCount}/{PROVIDERS.length} connected
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {providers.map((provider) => (
          <div
            key={provider.id}
            className={cn(
              'relative rounded-xl border bg-card p-5 transition-all',
              provider.connected && 'border-green-500/30'
            )}
          >
            {provider.connected && (
              <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-600">
                <Check className="size-3" /> Connected
              </div>
            )}
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Globe className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm">{provider.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {provider.description}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => toggleProvider(provider.id)}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium',
                  provider.connected
                    ? 'border border-destructive/30 text-destructive hover:bg-destructive/10'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                )}
              >
                {provider.connected ? 'Disconnect' : 'Connect'}
              </button>
              <a
                href={provider.docs}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground"
              >
                Docs <ExternalLink className="size-2.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Deployments</h2>
          <button
            onClick={loadDeployments}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="size-3.5" /> Refresh
          </button>
        </div>

        <div className="rounded-xl border bg-card divide-y">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : deployments.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Rocket className="mb-2 size-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No deployments yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Connect a provider and deploy your site to get started.
              </p>
            </div>
          ) : (
            deployments.map((d) => (
              <div key={d.id} className="flex items-center gap-4 px-5 py-3.5">
                {statusIcon(d.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {d.site?.name ?? d.siteId}
                    </span>
                    <span
                      className={cn(
                        'rounded px-1.5 py-0.5 text-[10px] font-medium',
                        d.status === 'SUCCESS'
                          ? 'bg-green-500/10 text-green-600'
                          : d.status === 'FAILED'
                            ? 'bg-red-500/10 text-red-600'
                            : 'bg-blue-500/10 text-blue-600'
                      )}
                    >
                      {d.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-[10px] text-muted-foreground">
                    <span>{d.type}</span>
                    <span>{d.pages} pages</span>
                    <span>{d.assets} assets</span>
                    <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {d.outputUrl && (
                    <a
                      href={d.outputUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded p-1.5 text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="size-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => deleteDeployment(d.id)}
                    className="rounded p-1.5 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          href="/deploy/ci"
          className="flex items-center gap-2 rounded-lg border bg-card px-4 py-3 text-sm font-medium hover:bg-accent"
        >
          <GitBranch className="size-4" /> CI/CD Pipelines{' '}
          <ChevronRight className="size-3.5 ml-auto text-muted-foreground" />
        </Link>
        <Link
          href="/deploy/secrets"
          className="flex items-center gap-2 rounded-lg border bg-card px-4 py-3 text-sm font-medium hover:bg-accent"
        >
          <Key className="size-4" /> Environment Secrets{' '}
          <ChevronRight className="size-3.5 ml-auto text-muted-foreground" />
        </Link>
      </div>
    </div>
  );
}
