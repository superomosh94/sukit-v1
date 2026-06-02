'use client';

import { useEffect, useState } from 'react';
import {
  GitBranch,
  Plus,
  Play,
  Pause,
  Trash2,
  Clock,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

interface Pipeline {
  id: string;
  name: string;
  repo: string;
  branch: string;
  provider: string;
  status: 'active' | 'paused';
  lastRun: string;
  lastStatus: string;
}

export default function CICDPage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const loadPipelines = async () => {
    try {
      const res = await fetch('/api/pipelines');
      const data = await res.json();
      setPipelines(Array.isArray(data) ? data : []);
    } catch {
      setPipelines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/pipelines');
        const data = await res.json();
        setPipelines(Array.isArray(data) ? data : []);
      } catch {
        setPipelines([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleStatus = async (id: string) => {
    setPipelines((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status:
                p.status === 'active'
                  ? ('paused' as const)
                  : ('active' as const),
            }
          : p
      )
    );
  };

  const deletePipeline = async (id: string) => {
    try {
      await fetch(`/api/pipelines/${id}`, { method: 'DELETE' });
      setPipelines((prev) => prev.filter((p) => p.id !== id));
    } catch {}
  };

  const createPipeline = async (
    name: string,
    repo: string,
    branch: string,
    provider: string
  ) => {
    const newPipeline: Pipeline = {
      id: `p-${Date.now()}`,
      name,
      repo,
      branch,
      provider,
      status: 'active',
      lastRun: new Date().toISOString(),
      lastStatus: 'success',
    };
    try {
      await fetch('/api/pipelines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPipeline),
      });
      setPipelines((prev) => [...prev, newPipeline]);
      setShowCreate(false);
    } catch {}
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="flex items-center gap-1 rounded bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-600">
            <CheckCircle2 className="size-3" /> Active
          </span>
        );
      case 'paused':
        return (
          <span className="flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600">
            <Pause className="size-3" /> Paused
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">CI/CD Pipelines</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Automated build and deployment pipelines
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          <Plus className="size-4" /> New Pipeline
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : pipelines.length === 0 && !showCreate ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-16 text-center">
          <GitBranch className="mb-3 size-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">
            No pipelines configured
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Create a pipeline to automatically build and deploy your sites from
            Git.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Create Pipeline
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {pipelines.map((pipeline) => (
            <div key={pipeline.id} className="rounded-xl border bg-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-sm">{pipeline.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                    <span className="font-mono">{pipeline.repo}</span>
                    <span className="rounded bg-muted px-1 font-mono text-[10px]">
                      {pipeline.branch}
                    </span>
                    <span>{pipeline.provider}</span>
                  </div>
                </div>
                {statusBadge(pipeline.status)}
              </div>
              <div className="mt-4 flex items-center justify-between border-t pt-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="size-3" /> Last run:{' '}
                  {new Date(pipeline.lastRun).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleStatus(pipeline.id)}
                    className="flex items-center gap-1 rounded px-2 py-1 hover:bg-accent"
                  >
                    {pipeline.status === 'active' ? (
                      <Pause className="size-3" />
                    ) : (
                      <Play className="size-3" />
                    )}
                    {pipeline.status === 'active' ? 'Pause' : 'Activate'}
                  </button>
                  <button
                    onClick={() => deletePipeline(pipeline.id)}
                    className="flex items-center gap-1 rounded px-2 py-1 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-3" /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <CreatePipelineDialog
          onClose={() => setShowCreate(false)}
          onCreate={createPipeline}
        />
      )}
    </div>
  );
}

function CreatePipelineDialog({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (
    name: string,
    repo: string,
    branch: string,
    provider: string
  ) => void;
}) {
  const [name, setName] = useState('');
  const [repo, setRepo] = useState('');
  const [branch, setBranch] = useState('main');
  const [provider, setProvider] = useState('vercel');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-[480px] rounded-lg border bg-card p-6 shadow-xl">
        <h3 className="mb-4 text-sm font-medium">Create Pipeline</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 h-8 w-full rounded-md border px-3 text-xs"
              placeholder="My Pipeline"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Repository</label>
            <input
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              className="mt-1 h-8 w-full rounded-md border px-3 text-xs font-mono"
              placeholder="owner/repo"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Branch</label>
            <input
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="mt-1 h-8 w-full rounded-md border px-3 text-xs font-mono"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="mt-1 h-8 w-full rounded-md border px-3 text-xs"
            >
              <option value="vercel">Vercel</option>
              <option value="netlify">Netlify</option>
              <option value="cloudflare">Cloudflare Pages</option>
              <option value="github-pages">GitHub Pages</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onCreate(name, repo, branch, provider)}
            disabled={!name || !repo}
            className="flex-1 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground disabled:opacity-50"
          >
            Create Pipeline
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-md border px-3 py-2 text-xs font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
