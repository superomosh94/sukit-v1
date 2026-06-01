import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  MediaStore,
  MediaAsset,
  MediaFolder,
  MediaTag,
  MediaVariant,
  UploadProgress,
  CropArea,
  ImageFilter,
  OptimizeOptions,
  PickerOptions,
  FileTypeFilter,
  SortField,
  ViewMode,
  SavedSearch,
  UsageRecord,
} from '../types';

const API_BASE = '/api/media';

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'API request failed');
  }
  return res.json() as Promise<T>;
}

let uploadIdCounter = 0;
function nextUploadId() {
  return `upload-${++uploadIdCounter}`;
}

export const useMediaStore = create<MediaStore>()(
  persist(
    (set, get) => ({
      assets: [],
      selectedIds: [],
      currentFolder: null,
      currentAsset: null,
      viewMode: 'grid',
      folders: [],
      tags: [],
      trash: [],
      uploadQueue: [],
      filters: { type: 'all', tags: [], search: '' },
      sortBy: 'date',
      sortOrder: 'desc',
      isLoading: false,
      error: null,
      hasMore: true,
      thumbnailSize: 'medium',
      dateRange: { from: null, to: null },
      uploaderFilter: null,
      sizeRange: { min: null, max: null },

      eventHandlers: new Map(),

      on: (event, handler) => {
        const handlers = get().eventHandlers.get(event) ?? new Set();
        handlers.add(handler);
        get().eventHandlers.set(event, handlers);
      },

      off: (event, handler) => {
        const handlers = get().eventHandlers.get(event);
        if (handlers) {
          handlers.delete(handler);
          if (handlers.size === 0) get().eventHandlers.delete(event);
        }
      },

      emit: async (event, data) => {
        const handlers = get().eventHandlers.get(event);
        if (!handlers) return;
        const payload = {
          type: event,
          data,
          timestamp: new Date().toISOString(),
        };
        for (const h of handlers) await Promise.resolve(h(payload));
      },

      // ---- Upload ----
      uploadFiles: async (files, folderId) => {
        set({ isLoading: true, error: null });
        const queue: UploadProgress[] = files.map((f) => ({
          fileId: nextUploadId(),
          filename: f.name,
          loaded: 0,
          total: f.size,
          percentage: 0,
          status: 'pending',
        }));
        set((s) => ({ uploadQueue: [...s.uploadQueue, ...queue] }));

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const entry = queue[i];
          try {
            set((s) => ({
              uploadQueue: s.uploadQueue.map((u) =>
                u.fileId === entry.fileId ? { ...u, status: 'uploading' } : u
              ),
            }));

            const formData = new FormData();
            formData.append('file', file);
            if (folderId) formData.append('folderId', folderId);

            const asset: MediaAsset = await fetch(`${API_BASE}/upload`, {
              method: 'POST',
              body: formData,
            }).then((r) => {
              if (!r.ok) throw new Error('Upload failed');
              return r.json();
            });

            set((s) => ({
              assets: [asset, ...s.assets],
              uploadQueue: s.uploadQueue.map((u) =>
                u.fileId === entry.fileId
                  ? {
                      ...u,
                      status: 'completed',
                      percentage: 100,
                      loaded: file.size,
                    }
                  : u
              ),
            }));

            await get().emit('media:afterUpload', { asset } as any);
          } catch (e: any) {
            set((s) => ({
              uploadQueue: s.uploadQueue.map((u) =>
                u.fileId === entry.fileId
                  ? { ...u, status: 'failed', error: e.message }
                  : u
              ),
            }));
          }
        }
        set({ isLoading: false });
      },

      uploadFromUrl: async (url, folderId) => {
        set({ isLoading: true });
        try {
          const asset = await apiFetch<MediaAsset>(`${API_BASE}/upload-url`, {
            method: 'POST',
            body: JSON.stringify({ url, folderId }),
          });
          set((s) => ({ assets: [asset, ...s.assets], isLoading: false }));
          return asset;
        } catch (e: any) {
          set({ error: e.message, isLoading: false });
          return null;
        }
      },

      cancelUpload: (fileId) => {
        set((s) => ({
          uploadQueue: s.uploadQueue.filter((u) => u.fileId !== fileId),
        }));
      },

      pauseUpload: (fileId) => {
        set((s) => ({
          uploadQueue: s.uploadQueue.map((u) =>
            u.fileId === fileId ? { ...u, status: 'pending' } : u
          ),
        }));
      },

      resumeUpload: (fileId) => {
        set((s) => ({
          uploadQueue: s.uploadQueue.map((u) =>
            u.fileId === fileId ? { ...u, status: 'uploading' } : u
          ),
        }));
      },

      retryUpload: async (fileId) => {
        const entry = get().uploadQueue.find((u) => u.fileId === fileId);
        if (!entry) return;
        const file = new File([], entry.filename);
        await get().uploadFiles([file], get().currentFolder ?? undefined);
      },

      clearCompletedUploads: () => {
        set((s) => ({
          uploadQueue: s.uploadQueue.filter(
            (u) => u.status === 'pending' || u.status === 'uploading'
          ),
        }));
      },

      // ---- CRUD ----
      loadAssets: async (folderId) => {
        set({ isLoading: true, error: null });
        try {
          const params = new URLSearchParams();
          if (folderId) params.set('folderId', folderId);
          const assets = await apiFetch<MediaAsset[]>(
            `${API_BASE}/list?${params}`
          );
          set({ assets, isLoading: false, hasMore: assets.length > 0 });
        } catch (e: any) {
          set({ error: e.message, isLoading: false });
        }
      },

      getAsset: async (id) => {
        try {
          return await apiFetch<MediaAsset>(`${API_BASE}/${id}`);
        } catch {
          return null;
        }
      },

      updateAsset: async (id, data) => {
        try {
          const updated = await apiFetch<MediaAsset>(`${API_BASE}/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
          });
          set((s) => ({
            assets: s.assets.map((a) => (a.id === id ? updated : a)),
            currentAsset: s.currentAsset?.id === id ? updated : s.currentAsset,
          }));
          await get().emit('media:afterUpdate', { asset: updated } as any);
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      deleteAsset: async (id) => {
        try {
          await get().emit('media:beforeDelete', { assetId: id } as any);
          await apiFetch(`${API_BASE}/${id}`, { method: 'DELETE' });
          set((s) => ({
            assets: s.assets.filter((a) => a.id !== id),
            currentAsset: s.currentAsset?.id === id ? null : s.currentAsset,
            selectedIds: s.selectedIds.filter((sid) => sid !== id),
          }));
          await get().emit('media:afterDelete', { assetId: id } as any);
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      permanentlyDeleteAsset: async (id) => {
        try {
          await apiFetch(`${API_BASE}/${id}/permanent`, { method: 'DELETE' });
          set((s) => ({
            trash: s.trash.filter((a) => a.id !== id),
            selectedIds: s.selectedIds.filter((sid) => sid !== id),
          }));
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      restoreAsset: async (id) => {
        try {
          const asset = await apiFetch<MediaAsset>(
            `${API_BASE}/${id}/restore`,
            {
              method: 'POST',
            }
          );
          set((s) => ({
            assets: [asset, ...s.assets],
            trash: s.trash.filter((a) => a.id !== id),
          }));
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      duplicateAsset: async (id, newFilename) => {
        try {
          const asset = await apiFetch<MediaAsset>(
            `${API_BASE}/${id}/duplicate`,
            {
              method: 'POST',
              body: JSON.stringify({ newFilename }),
            }
          );
          set((s) => ({ assets: [asset, ...s.assets] }));
          return asset;
        } catch (e: any) {
          set({ error: e.message });
          return null;
        }
      },

      setCurrentAsset: (id) => {
        const asset = get().assets.find((a) => a.id === id) ?? null;
        set({ currentAsset: asset });
      },

      // ---- Bulk ----
      bulkDelete: async (ids) => {
        try {
          await apiFetch(`${API_BASE}/bulk/delete`, {
            method: 'POST',
            body: JSON.stringify({ ids }),
          });
          set((s) => ({
            assets: s.assets.filter((a) => !ids.includes(a.id)),
            selectedIds: s.selectedIds.filter((sid) => !ids.includes(sid)),
          }));
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      bulkPermanentDelete: async (ids) => {
        try {
          await apiFetch(`${API_BASE}/bulk/permanent-delete`, {
            method: 'POST',
            body: JSON.stringify({ ids }),
          });
          set((s) => ({
            trash: s.trash.filter((a) => !ids.includes(a.id)),
            selectedIds: s.selectedIds.filter((sid) => !ids.includes(sid)),
          }));
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      bulkRestore: async (ids) => {
        try {
          const restored = await apiFetch<MediaAsset[]>(
            `${API_BASE}/bulk/restore`,
            {
              method: 'POST',
              body: JSON.stringify({ ids }),
            }
          );
          set((s) => ({
            assets: [...restored, ...s.assets],
            trash: s.trash.filter((a) => !ids.includes(a.id)),
          }));
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      bulkMove: async (ids, folderId) => {
        try {
          await apiFetch(`${API_BASE}/bulk/move`, {
            method: 'POST',
            body: JSON.stringify({ ids, folderId }),
          });
          set((s) => ({
            assets: s.assets.map((a) =>
              ids.includes(a.id) ? { ...a, folderId } : a
            ),
          }));
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      bulkAddTags: async (ids, tags) => {
        try {
          await apiFetch(`${API_BASE}/bulk/tags`, {
            method: 'POST',
            body: JSON.stringify({ ids, tags }),
          });
          await get().loadAssets(get().currentFolder ?? undefined);
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      bulkRemoveTags: async (ids, tags) => {
        try {
          await apiFetch(`${API_BASE}/bulk/remove-tags`, {
            method: 'POST',
            body: JSON.stringify({ ids, tags }),
          });
          await get().loadAssets(get().currentFolder ?? undefined);
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      bulkEditAltText: async (ids, altText) => {
        try {
          await apiFetch(`${API_BASE}/bulk/alt-text`, {
            method: 'POST',
            body: JSON.stringify({ ids, altText }),
          });
          set((s) => ({
            assets: s.assets.map((a) =>
              ids.includes(a.id) ? { ...a, alt: altText } : a
            ),
          }));
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      bulkEditCaption: async (ids, caption) => {
        try {
          await apiFetch(`${API_BASE}/bulk/caption`, {
            method: 'POST',
            body: JSON.stringify({ ids, caption }),
          });
          set((s) => ({
            assets: s.assets.map((a) =>
              ids.includes(a.id) ? { ...a, caption } : a
            ),
          }));
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      bulkFavorite: async (ids) => {
        try {
          await apiFetch(`${API_BASE}/bulk/favorite`, {
            method: 'POST',
            body: JSON.stringify({ ids }),
          });
          set((s) => ({
            assets: s.assets.map((a) =>
              ids.includes(a.id) ? { ...a, isFavorited: true } : a
            ),
          }));
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      bulkUnfavorite: async (ids) => {
        try {
          await apiFetch(`${API_BASE}/bulk/unfavorite`, {
            method: 'POST',
            body: JSON.stringify({ ids }),
          });
          set((s) => ({
            assets: s.assets.map((a) =>
              ids.includes(a.id) ? { ...a, isFavorited: false } : a
            ),
          }));
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      bulkOptimize: async (ids: string[]) => {
        try {
          await apiFetch(`${API_BASE}/bulk/optimize`, {
            method: 'POST',
            body: JSON.stringify({ ids }),
          });
          await get().emit('media:afterBulkOptimize', { ids } as any);
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      bulkDownload: async (ids) => {
        try {
          const res = await fetch(`${API_BASE}/bulk/download`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids }),
          });
          return await res.blob();
        } catch {
          return null;
        }
      },

      // ---- Selection ----
      toggleSelection: (id) => {
        set((s) => ({
          selectedIds: s.selectedIds.includes(id)
            ? s.selectedIds.filter((sid) => sid !== id)
            : [...s.selectedIds, id],
        }));
      },

      selectAll: () => {
        set((s) => ({ selectedIds: s.assets.map((a) => a.id) }));
      },

      clearSelection: () => set({ selectedIds: [] }),

      invertSelection: () => {
        set((s) => {
          const allIds = s.assets.map((a) => a.id);
          return {
            selectedIds: allIds.filter((id) => !s.selectedIds.includes(id)),
          };
        });
      },

      selectRange: (startId, endId) => {
        const allIds = get().assets.map((a) => a.id);
        const startIdx = allIds.indexOf(startId);
        const endIdx = allIds.indexOf(endId);
        if (startIdx === -1 || endIdx === -1) return;
        const [from, to] =
          startIdx <= endIdx ? [startIdx, endIdx] : [endIdx, startIdx];
        set({ selectedIds: allIds.slice(from, to + 1) });
      },

      selectAllInFolder: () => {
        const folderId = get().currentFolder;
        const ids = folderId
          ? get()
              .assets.filter((a) => a.folderId === folderId)
              .map((a) => a.id)
          : get().assets.map((a) => a.id);
        set({ selectedIds: ids });
      },

      // ---- Folders ----
      createFolder: async (name, parentId) => {
        try {
          const folder = await apiFetch<MediaFolder>(`/api/folders`, {
            method: 'POST',
            body: JSON.stringify({ name, parentId }),
          });
          set((s) => ({ folders: [...s.folders, folder] }));
          return folder;
        } catch (e: any) {
          set({ error: e.message });
          return null;
        }
      },

      renameFolder: async (id, name) => {
        try {
          const updated = await apiFetch<MediaFolder>(`/api/folders/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ name }),
          });
          set((s) => ({
            folders: s.folders.map((f) => (f.id === id ? updated : f)),
          }));
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      deleteFolder: async (id) => {
        try {
          await apiFetch(`/api/folders/${id}`, { method: 'DELETE' });
          set((s) => ({
            folders: s.folders.filter((f) => f.id !== id),
            currentFolder: s.currentFolder === id ? null : s.currentFolder,
          }));
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      moveFolder: async (id, newParentId) => {
        try {
          const updated = await apiFetch<MediaFolder>(
            `/api/folders/${id}/move`,
            {
              method: 'POST',
              body: JSON.stringify({ parentId: newParentId }),
            }
          );
          set((s) => ({
            folders: s.folders.map((f) => (f.id === id ? updated : f)),
          }));
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      loadFolders: async () => {
        try {
          const folders = await apiFetch<MediaFolder[]>(`/api/folders`);
          set({ folders });
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      setCurrentFolder: (id) => {
        set({ currentFolder: id, currentAsset: null, selectedIds: [] });
        get().loadAssets(id ?? undefined);
      },

      // ---- Tags ----
      createTag: async (name) => {
        try {
          const tag = await apiFetch<MediaTag>(`/api/tags`, {
            method: 'POST',
            body: JSON.stringify({ name }),
          });
          set((s) => ({ tags: [...s.tags, tag] }));
          return tag;
        } catch (e: any) {
          set({ error: e.message });
          return null;
        }
      },

      updateTag: async (id, data) => {
        try {
          const updated = await apiFetch<MediaTag>(`/api/tags/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
          });
          set((s) => ({
            tags: s.tags.map((t) => (t.id === id ? updated : t)),
          }));
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      deleteTag: async (id) => {
        try {
          await apiFetch(`/api/tags/${id}`, { method: 'DELETE' });
          set((s) => ({ tags: s.tags.filter((t) => t.id !== id) }));
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      loadTags: async () => {
        try {
          const tags = await apiFetch<MediaTag[]>(`/api/tags`);
          set({ tags });
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      getTagsForAsset: async (assetId) => {
        try {
          return await apiFetch<MediaTag[]>(`/api/assets/${assetId}/tags`);
        } catch {
          return [];
        }
      },

      // ---- Favorites ----
      toggleFavorite: async (assetId) => {
        const isFav = get().assets.find((a) => a.id === assetId)?.isFavorited;
        try {
          if (isFav) {
            await apiFetch(`/api/favorites/${assetId}`, { method: 'DELETE' });
          } else {
            await apiFetch(`/api/favorites/${assetId}`, { method: 'POST' });
          }
          set((s) => ({
            assets: s.assets.map((a) =>
              a.id === assetId ? { ...a, isFavorited: !isFav } : a
            ),
          }));
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      loadFavorites: async () => {
        set({ isLoading: true });
        try {
          const assets = await apiFetch<MediaAsset[]>(`/api/favorites`);
          set({ assets, isLoading: false });
        } catch (e: any) {
          set({ error: e.message, isLoading: false });
        }
      },

      // ---- Editing ----
      cropAsset: async (id, crop) => {
        try {
          const asset = await apiFetch<MediaAsset>(`${API_BASE}/${id}/crop`, {
            method: 'POST',
            body: JSON.stringify(crop),
          });
          set((s) => ({
            assets: s.assets.map((a) => (a.id === id ? asset : a)),
            currentAsset: asset,
          }));
          return asset;
        } catch (e: any) {
          set({ error: e.message });
          return null;
        }
      },

      resizeAsset: async (id, width, height) => {
        try {
          const asset = await apiFetch<MediaAsset>(`${API_BASE}/${id}/resize`, {
            method: 'POST',
            body: JSON.stringify({ width, height }),
          });
          set((s) => ({
            assets: s.assets.map((a) => (a.id === id ? asset : a)),
            currentAsset: asset,
          }));
          return asset;
        } catch (e: any) {
          set({ error: e.message });
          return null;
        }
      },

      rotateAsset: async (id, degrees) => {
        try {
          const asset = await apiFetch<MediaAsset>(`${API_BASE}/${id}/rotate`, {
            method: 'POST',
            body: JSON.stringify({ degrees }),
          });
          set((s) => ({
            assets: s.assets.map((a) => (a.id === id ? asset : a)),
            currentAsset: asset,
          }));
          return asset;
        } catch (e: any) {
          set({ error: e.message });
          return null;
        }
      },

      flipAsset: async (id, direction) => {
        try {
          const asset = await apiFetch<MediaAsset>(`${API_BASE}/${id}/flip`, {
            method: 'POST',
            body: JSON.stringify({ direction }),
          });
          set((s) => ({
            assets: s.assets.map((a) => (a.id === id ? asset : a)),
            currentAsset: asset,
          }));
          return asset;
        } catch (e: any) {
          set({ error: e.message });
          return null;
        }
      },

      applyFilter: async (id, filter) => {
        try {
          const asset = await apiFetch<MediaAsset>(`${API_BASE}/${id}/filter`, {
            method: 'POST',
            body: JSON.stringify(filter),
          });
          set((s) => ({
            assets: s.assets.map((a) => (a.id === id ? asset : a)),
            currentAsset: asset,
          }));
          return asset;
        } catch (e: any) {
          set({ error: e.message });
          return null;
        }
      },

      resetEdits: async (assetId) => {
        try {
          const asset = await apiFetch<MediaAsset>(
            `${API_BASE}/${assetId}/reset`,
            {
              method: 'POST',
            }
          );
          set((s) => ({
            assets: s.assets.map((a) => (a.id === assetId ? asset : a)),
            currentAsset: asset,
          }));
          return asset;
        } catch (e: any) {
          set({ error: e.message });
          return null;
        }
      },

      // ---- Optimization ----
      optimizeAsset: async (id, options) => {
        try {
          return await apiFetch<MediaVariant>(`${API_BASE}/${id}/optimize`, {
            method: 'POST',
            body: JSON.stringify(options),
          });
        } catch {
          return null;
        }
      },

      generateVariants: async (id) => {
        try {
          const variants = await apiFetch<MediaVariant[]>(
            `${API_BASE}/${id}/variants`,
            { method: 'POST' }
          );
          set((s) => ({
            assets: s.assets.map((a) => (a.id === id ? { ...a, variants } : a)),
          }));
          return variants;
        } catch {
          return [];
        }
      },

      // ---- URLs ----
      getUrl: (id, variant) => {
        const asset = get().assets.find((a) => a.id === id);
        if (!asset) return '';
        if (variant && asset.variants) {
          const v = asset.variants.find((mv) => mv.type === variant);
          if (v) return v.path;
        }
        return asset.url ?? asset.thumbnailUrl ?? '';
      },

      getSrcSet: (id) => {
        const asset = get().assets.find((a) => a.id === id);
        if (!asset?.variants) return '';
        return asset.variants
          .filter((v) => ['small', 'medium', 'large', 'xl'].includes(v.type))
          .map((v) => `${v.path} ${v.width}w`)
          .join(', ');
      },

      copyUrl: (id, format) => {
        const asset = get().assets.find((a) => a.id === id);
        if (!asset) return '';
        const url = asset.url ?? '';
        switch (format) {
          case 'markdown':
            return `![${asset.alt ?? asset.filename}](${url})`;
          case 'html':
            return `<img src="${url}" alt="${asset.alt ?? ''}" />`;
          default:
            return url;
        }
      },

      // ---- Search & Filters ----
      searchAssets: async (query) => {
        set({ isLoading: true });
        try {
          const params = new URLSearchParams({ q: query });
          if (get().currentFolder) params.set('folderId', get().currentFolder!);
          const assets = await apiFetch<MediaAsset[]>(
            `${API_BASE}/search?${params}`
          );
          set({
            assets,
            isLoading: false,
            filters: { ...get().filters, search: query },
          });
        } catch (e: any) {
          set({ error: e.message, isLoading: false });
        }
      },

      setFilterType: (type) => {
        set((s) => ({ filters: { ...s.filters, type } }));
      },

      setFilterTags: (tags) => {
        set((s) => ({ filters: { ...s.filters, tags } }));
      },

      setFilterDateRange: (from, to) => {
        set({ dateRange: { from, to } });
      },

      setFilterUploader: (userId) => {
        set({ uploaderFilter: userId });
      },

      setFilterSize: (min, max) => {
        set({ sizeRange: { min, max } });
      },

      setSortBy: (field) => {
        set({ sortBy: field });
      },

      toggleSortOrder: () => {
        set((s) => ({ sortOrder: s.sortOrder === 'asc' ? 'desc' : 'asc' }));
      },

      clearFilters: () => {
        set({
          filters: { type: 'all', tags: [], search: '' },
          sortBy: 'date',
          sortOrder: 'desc',
          dateRange: { from: null, to: null },
          uploaderFilter: null,
          sizeRange: { min: null, max: null },
        });
        get().loadAssets(get().currentFolder ?? undefined);
      },

      setThumbnailSize: (size) => {
        set({ thumbnailSize: size });
      },

      // ---- Pagination ----
      loadMoreAssets: async () => {
        const { assets, currentFolder, isLoading, hasMore } = get();
        if (isLoading || !hasMore) return;
        set({ isLoading: true });
        try {
          const params = new URLSearchParams({ offset: String(assets.length) });
          if (currentFolder) params.set('folderId', currentFolder);
          const more = await apiFetch<MediaAsset[]>(
            `${API_BASE}/list?${params}`
          );
          set((s) => ({
            assets: [...s.assets, ...more],
            isLoading: false,
            hasMore: more.length > 0,
          }));
        } catch (e: any) {
          set({ error: e.message, isLoading: false });
        }
      },

      // ---- Trash ----
      loadTrash: async () => {
        set({ isLoading: true });
        try {
          const trash = await apiFetch<MediaAsset[]>(`${API_BASE}/trash`);
          set({ trash, isLoading: false });
        } catch (e: any) {
          set({ error: e.message, isLoading: false });
        }
      },

      emptyTrash: async () => {
        try {
          await apiFetch(`${API_BASE}/trash/empty`, { method: 'POST' });
          set({ trash: [] });
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      // ---- Picker (Visual Builder Integration) ----
      openPicker: async (options) => {
        return new Promise((resolve) => {
          const handler = (event: CustomEvent) => {
            (globalThis as any).removeEventListener(
              'media-picker-select',
              handler as any
            );
            resolve(event.detail);
          };
          (globalThis as any).addEventListener(
            'media-picker-select',
            handler as any
          );

          (globalThis as any).dispatchEvent(
            new (globalThis as any).CustomEvent('media-picker-open', {
              detail: options,
            })
          );
        });
      },

      // ---- Visual Builder ----
      insertIntoBlock: (asset, blockId, property) => {
        (globalThis as any).dispatchEvent(
          new (globalThis as any).CustomEvent('media:insertIntoBlock', {
            detail: { asset, blockId, property },
          })
        );
      },

      setAsBackground: (asset, blockId) => {
        (globalThis as any).dispatchEvent(
          new (globalThis as any).CustomEvent('media:setAsBackground', {
            detail: { asset, blockId },
          })
        );
      },

      // ---- Usage tracking ----
      getUsage: async (assetId) => {
        try {
          return await apiFetch<UsageRecord[]>(`${API_BASE}/${assetId}/usage`);
        } catch {
          return [];
        }
      },

      trackUsage: async (assetId, pageId, blockId, property) => {
        try {
          await apiFetch(`${API_BASE}/${assetId}/track`, {
            method: 'POST',
            body: JSON.stringify({ pageId, blockId, property }),
          });
        } catch {
          // silently fail
        }
      },

      // ---- Saved searches ----
      saveSearch: async (name) => {
        try {
          await apiFetch(`${API_BASE}/searches`, {
            method: 'POST',
            body: JSON.stringify({
              name,
              filters: get().filters,
              sortBy: get().sortBy,
              sortOrder: get().sortOrder,
            }),
          });
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      loadSavedSearch: async (searchId) => {
        try {
          const search = await apiFetch<SavedSearch>(
            `${API_BASE}/searches/${searchId}`
          );
          set({
            filters: search.filters,
            sortBy: search.sortBy,
            sortOrder: search.sortOrder,
          });
          await get().loadAssets(get().currentFolder ?? undefined);
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      getSavedSearches: async () => {
        try {
          return await apiFetch<SavedSearch[]>(`${API_BASE}/searches`);
        } catch {
          return [];
        }
      },

      // ---- UI ----
      setViewMode: (mode) => set({ viewMode: mode }),
      setLoading: (loading) => set({ isLoading: loading }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'sukit-media-library',
      partialize: (state) => ({
        viewMode: state.viewMode,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        currentFolder: state.currentFolder,
        filters: state.filters,
        thumbnailSize: state.thumbnailSize,
      }),
    }
  )
);
