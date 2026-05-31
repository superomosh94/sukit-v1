import { createKernel, type SukitKernel, type FSAdapter, type StorageAdapter, type SitesAdapter, type PagesAdapter, type MediaAdapter, type SettingsAdapter, type ExportAdapter } from "@sukit/core";

let kernelInstance: SukitKernel | null = null;

export function createSukitKernel(): SukitKernel {
  if (kernelInstance) return kernelInstance;

  const fsAdapter: FSAdapter = {
    async readFile(path) {
      const res = await fetch(`/api/fs/read?path=${encodeURIComponent(path)}`);
      return res.text();
    },
    async writeFile(path, content) {
      await fetch("/api/fs/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, content }),
      });
    },
    async exists(path) {
      const res = await fetch(`/api/fs/exists?path=${encodeURIComponent(path)}`);
      return res.json();
    },
    async readDirectory(path) {
      const res = await fetch(`/api/fs/list?dir=${encodeURIComponent(path)}`);
      return res.json();
    },
    async deleteFile(path) {
      await fetch("/api/fs/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });
    },
    async createDirectory(path) {
      await fetch("/api/fs/mkdir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });
    },
  };

  const kernel = createKernel({
    fs: fsAdapter,
  });

  kernelInstance = kernel;

  if (typeof window !== "undefined") {
    (window as any).__SUKIT__ = kernel;
  }

  return kernel;
}

export function getSukitKernel(): SukitKernel {
  if (!kernelInstance) throw new Error("Kernel not initialized. Call createSukitKernel() first.");
  return kernelInstance;
}
