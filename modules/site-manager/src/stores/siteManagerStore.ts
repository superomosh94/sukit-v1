import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Site,
  Page,
  TeamMember,
  ActivityLogEntry,
  SiteStats,
  SiteSearchResult,
  CreateSiteInput,
  CreatePageInput,
  TeamRole,
  BackupEntry,
  SiteTemplate,
  EventPayload,
  EventHandler,
  SiteManagerStore,
} from '../types';

const API_BASE = '/api/sites';

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'API request failed');
  }
  return res.json();
}

export const useSiteManagerStore = create<SiteManagerStore>()(
  persist(
    (set, get) => ({
      sites: [],
      currentSiteId: null,
      currentSite: null,
      pages: [],
      currentPageId: null,
      currentPage: null,
      team: [],
      activity: [],
      stats: null,
      searchResults: [],
      searchQuery: '',
      isLoading: false,
      error: null,

      eventHandlers: new Map(),

      on: (event: string, handler: EventHandler) => {
        const handlers = get().eventHandlers.get(event) ?? new Set();
        handlers.add(handler);
        get().eventHandlers.set(event, handlers);
      },

      off: (event: string, handler: EventHandler) => {
        const handlers = get().eventHandlers.get(event);
        if (handlers) {
          handlers.delete(handler);
          if (handlers.size === 0) get().eventHandlers.delete(event);
        }
      },

      emit: async (event: string, data: Record<string, unknown>) => {
        const handlers = get().eventHandlers.get(event);
        if (!handlers) return;
        const payload: EventPayload = {
          type: event,
          data,
          timestamp: new Date().toISOString(),
          userId: get().currentSite?.createdBy ?? 'unknown',
        };
        for (const handler of handlers) {
          await Promise.resolve(handler(payload));
        }
      },

      // ---- Site actions ----
      loadSites: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await apiFetch<Site[]>(API_BASE);
          set({ sites: data, isLoading: false });
        } catch (e: any) {
          set({ error: e.message, isLoading: false });
        }
      },

      createSite: async (input: CreateSiteInput) => {
        set({ isLoading: true });
        try {
          const site = await apiFetch<Site>(API_BASE, {
            method: 'POST',
            body: JSON.stringify(input),
          });
          set((s) => ({ sites: [...s.sites, site], isLoading: false }));
          await get().emit('site:afterCreate', { site } as any);
          return site;
        } catch (e: any) {
          set({ error: e.message, isLoading: false });
          return null;
        }
      },

      updateSite: async (siteId: string, data: Partial<Site>) => {
        try {
          const updated = await apiFetch<Site>(`${API_BASE}/${siteId}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
          });
          set((s) => ({
            sites: s.sites.map((site) => (site.id === siteId ? updated : site)),
            currentSite: s.currentSiteId === siteId ? updated : s.currentSite,
          }));
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      deleteSite: async (siteId: string, permanent?: boolean) => {
        try {
          await apiFetch(`${API_BASE}/${siteId}`, {
            method: permanent ? 'DELETE' : 'POST',
            body: JSON.stringify({
              action: permanent ? 'hard_delete' : 'trash',
            }),
          });
          if (permanent) {
            set((s) => ({
              sites: s.sites.filter((site) => site.id !== siteId),
            }));
          } else {
            set((s) => ({
              sites: s.sites.map((site) =>
                site.id === siteId
                  ? { ...site, status: 'trashed' as const }
                  : site
              ),
            }));
          }
          await get().emit('site:afterDelete', { siteId } as any);
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      restoreSite: async (siteId: string) => {
        try {
          const restored = await apiFetch<Site>(
            `${API_BASE}/${siteId}/restore`,
            {
              method: 'POST',
            }
          );
          set((s) => ({
            sites: s.sites.map((site) =>
              site.id === siteId ? restored : site
            ),
          }));
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      archiveSite: async (siteId: string) => {
        try {
          const archived = await apiFetch<Site>(
            `${API_BASE}/${siteId}/archive`,
            {
              method: 'POST',
            }
          );
          set((s) => ({
            sites: s.sites.map((site) =>
              site.id === siteId ? archived : site
            ),
          }));
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      setCurrentSite: async (siteId: string) => {
        const site = get().sites.find((s) => s.id === siteId);
        set({
          currentSiteId: siteId,
          currentSite: site ?? null,
          currentPageId: null,
          currentPage: null,
        });
        if (site) {
          await get().loadPages(siteId);
          await get().loadTeam(siteId);
          await get().loadActivity(siteId);
        }
      },

      duplicateSite: async (siteId: string) => {
        set({ isLoading: true });
        try {
          const dup = await apiFetch<Site>(`${API_BASE}/${siteId}/duplicate`, {
            method: 'POST',
          });
          set((s) => ({ sites: [...s.sites, dup], isLoading: false }));
          return dup;
        } catch (e: any) {
          set({ error: e.message, isLoading: false });
          return null;
        }
      },

      // ---- Page actions ----
      loadPages: async (siteId: string) => {
        try {
          const pages = await apiFetch<Page[]>(`${API_BASE}/${siteId}/pages`);
          set({ pages });
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      createPage: async (input: CreatePageInput) => {
        set({ isLoading: true });
        try {
          await get().emit('site:beforePageCreate', input as any);
          const page = await apiFetch<Page>(
            `${API_BASE}/${input.siteId}/pages`,
            {
              method: 'POST',
              body: JSON.stringify(input),
            }
          );
          set((s) => ({ pages: [...s.pages, page], isLoading: false }));
          await get().emit('site:afterPageCreate', { page } as any);
          return page;
        } catch (e: any) {
          set({ error: e.message, isLoading: false });
          return null;
        }
      },

      updatePage: async (pageId: string, data: Partial<Page>) => {
        const siteId = get().currentSiteId;
        if (!siteId) return;
        try {
          const updated = await apiFetch<Page>(
            `${API_BASE}/${siteId}/pages/${pageId}`,
            {
              method: 'PATCH',
              body: JSON.stringify(data),
            }
          );
          set((s) => ({
            pages: s.pages.map((p) => (p.id === pageId ? updated : p)),
            currentPage: s.currentPageId === pageId ? updated : s.currentPage,
          }));
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      deletePage: async (pageId: string, permanent?: boolean) => {
        const siteId = get().currentSiteId;
        if (!siteId) return;
        try {
          await get().emit('site:beforePageDelete', { pageId } as any);
          await apiFetch(`${API_BASE}/${siteId}/pages/${pageId}`, {
            method: permanent ? 'DELETE' : 'POST',
            body: JSON.stringify({
              action: permanent ? 'hard_delete' : 'trash',
            }),
          });
          if (permanent) {
            set((s) => ({ pages: s.pages.filter((p) => p.id !== pageId) }));
          } else {
            set((s) => ({
              pages: s.pages.map((p) =>
                p.id === pageId ? { ...p, status: 'trashed' as const } : p
              ),
            }));
          }
          await get().emit('site:afterPageDelete', { pageId } as any);
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      restorePage: async (pageId: string) => {
        const siteId = get().currentSiteId;
        if (!siteId) return;
        try {
          const restored = await apiFetch<Page>(
            `${API_BASE}/${siteId}/pages/${pageId}/restore`,
            { method: 'POST' }
          );
          set((s) => ({
            pages: s.pages.map((p) => (p.id === pageId ? restored : p)),
          }));
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      duplicatePage: async (pageId: string) => {
        const siteId = get().currentSiteId;
        if (!siteId) return null;
        set({ isLoading: true });
        try {
          const dup = await apiFetch<Page>(
            `${API_BASE}/${siteId}/pages/${pageId}/duplicate`,
            { method: 'POST' }
          );
          set((s) => ({ pages: [...s.pages, dup], isLoading: false }));
          return dup;
        } catch (e: any) {
          set({ error: e.message, isLoading: false });
          return null;
        }
      },

      reorderPages: async (
        pageId: string,
        parentId: string | null,
        order: number
      ) => {
        const siteId = get().currentSiteId;
        if (!siteId) return;
        try {
          await apiFetch(`${API_BASE}/${siteId}/pages/${pageId}/reorder`, {
            method: 'POST',
            body: JSON.stringify({ parentId, order }),
          });
          await get().loadPages(siteId);
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      setCurrentPage: (pageId: string) => {
        const page = get().pages.find((p) => p.id === pageId) ?? null;
        set({ currentPageId: pageId, currentPage: page });
      },

      // ---- Team actions ----
      loadTeam: async (siteId: string) => {
        try {
          const team = await apiFetch<TeamMember[]>(
            `${API_BASE}/${siteId}/team`
          );
          set({ team });
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      inviteMember: async (siteId: string, email: string, role: TeamRole) => {
        try {
          const member = await apiFetch<TeamMember>(
            `${API_BASE}/${siteId}/team/invite`,
            {
              method: 'POST',
              body: JSON.stringify({ email, role }),
            }
          );
          set((s) => ({ team: [...s.team, member] }));
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      updateMemberRole: async (memberId: string, role: TeamRole) => {
        const siteId = get().currentSiteId;
        if (!siteId) return;
        try {
          const updated = await apiFetch<TeamMember>(
            `${API_BASE}/${siteId}/team/${memberId}`,
            { method: 'PATCH', body: JSON.stringify({ role }) }
          );
          set((s) => ({
            team: s.team.map((m) => (m.id === memberId ? updated : m)),
          }));
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      removeMember: async (memberId: string) => {
        const siteId = get().currentSiteId;
        if (!siteId) return;
        try {
          await apiFetch(`${API_BASE}/${siteId}/team/${memberId}`, {
            method: 'DELETE',
          });
          set((s) => ({ team: s.team.filter((m) => m.id !== memberId) }));
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      transferOwnership: async (siteId: string, userId: string) => {
        try {
          await apiFetch(`${API_BASE}/${siteId}/team/transfer`, {
            method: 'POST',
            body: JSON.stringify({ userId }),
          });
          await get().loadTeam(siteId);
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      // ---- Activity ----
      loadActivity: async (siteId: string, limit = 20) => {
        try {
          const activity = await apiFetch<ActivityLogEntry[]>(
            `${API_BASE}/${siteId}/activity?limit=${limit}`
          );
          set({ activity });
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      logActivity: async (entry) => {
        const siteId = get().currentSiteId;
        if (!siteId) return;
        try {
          const logged = await apiFetch<ActivityLogEntry>(
            `${API_BASE}/${siteId}/activity`,
            { method: 'POST', body: JSON.stringify(entry) }
          );
          set((s) => ({ activity: [logged, ...s.activity].slice(0, 100) }));
        } catch {}
      },

      // ---- Search ----
      search: async (query: string, siteId?: string) => {
        set({ searchQuery: query });
        if (!query.trim()) {
          set({ searchResults: [] });
          return;
        }
        try {
          const params = new URLSearchParams({ q: query });
          if (siteId) params.set('siteId', siteId);
          const results = await apiFetch<SiteSearchResult[]>(
            `${API_BASE}/search?${params}`
          );
          set({ searchResults: results });
        } catch {
          set({ searchResults: [] });
        }
      },

      // ---- Stats ----
      loadStats: async (siteId: string) => {
        try {
          const stats = await apiFetch<SiteStats>(
            `${API_BASE}/${siteId}/stats`
          );
          set({ stats });
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      // ---- Templates ----
      loadTemplates: async () => {
        try {
          const templates = await apiFetch<SiteTemplate[]>(
            `${API_BASE}/templates`
          );
          set({});
        } catch {}
      },

      saveAsTemplate: async (
        siteId: string,
        name: string,
        category?: string
      ) => {
        try {
          await apiFetch(`${API_BASE}/${siteId}/templates`, {
            method: 'POST',
            body: JSON.stringify({ name, category }),
          });
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      applyTemplate: async (siteId: string, templateId: string) => {
        set({ isLoading: true });
        try {
          await apiFetch(
            `${API_BASE}/${siteId}/templates/${templateId}/apply`,
            {
              method: 'POST',
            }
          );
          set({ isLoading: false });
        } catch (e: any) {
          set({ error: e.message, isLoading: false });
        }
      },

      deleteTemplate: async (templateId: string) => {
        try {
          await apiFetch(`${API_BASE}/templates/${templateId}`, {
            method: 'DELETE',
          });
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      // ---- Backups ----
      createBackup: async (siteId: string) => {
        try {
          await apiFetch(`${API_BASE}/${siteId}/backups`, {
            method: 'POST',
          });
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      loadBackups: async (siteId: string) => {
        try {
          return await apiFetch<BackupEntry[]>(`${API_BASE}/${siteId}/backups`);
        } catch {
          return [];
        }
      },

      restoreBackup: async (siteId: string, backupId: string) => {
        set({ isLoading: true });
        try {
          await apiFetch(`${API_BASE}/${siteId}/backups/${backupId}/restore`, {
            method: 'POST',
          });
          set({ isLoading: false });
        } catch (e: any) {
          set({ error: e.message, isLoading: false });
        }
      },

      downloadBackup: async (siteId: string, backupId: string) => {
        try {
          const blob = await fetch(
            `${API_BASE}/${siteId}/backups/${backupId}/download`
          ).then((r) => r.blob());
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `backup-${siteId}-${backupId}.json`;
          a.click();
          URL.revokeObjectURL(url);
        } catch {}
      },

      // ---- Import/Export ----
      exportSite: async (siteId: string, options) => {
        const params = new URLSearchParams();
        if (options?.includeMedia === false) params.set('noMedia', 'true');
        if (options?.encrypt) params.set('encrypt', 'true');
        const data = await apiFetch<string>(
          `${API_BASE}/${siteId}/export?${params}`
        );
        return data;
      },

      importSite: async (data: string, options) => {
        set({ isLoading: true });
        try {
          const site = await apiFetch<Site>(`${API_BASE}/import`, {
            method: 'POST',
            body: JSON.stringify({ data, overwrite: options?.overwrite }),
          });
          set((s) => ({ sites: [...s.sites, site], isLoading: false }));
          return site;
        } catch (e: any) {
          set({ error: e.message, isLoading: false });
          return null;
        }
      },

      setSearchQuery: (query: string) => set({ searchQuery: query }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      clearError: () => set({ error: null }),

      // ---- Bulk Operations ----
      bulkPublishPages: async (pageIds: string[]) => {
        try {
          await apiFetch(`${API_BASE}/pages/bulk`, {
            method: 'POST',
            body: JSON.stringify({ action: 'publish', pageIds }),
          });
          const siteId = get().currentSiteId;
          if (siteId) await get().loadPages(siteId);
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      bulkDeletePages: async (pageIds: string[]) => {
        try {
          await apiFetch(`${API_BASE}/pages/bulk`, {
            method: 'POST',
            body: JSON.stringify({ action: 'delete', pageIds }),
          });
          const siteId = get().currentSiteId;
          if (siteId) await get().loadPages(siteId);
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      bulkMovePages: async (pageIds: string[], newParentId: string | null) => {
        try {
          await apiFetch(`${API_BASE}/pages/bulk`, {
            method: 'POST',
            body: JSON.stringify({ action: 'move', pageIds, newParentId }),
          });
          const siteId = get().currentSiteId;
          if (siteId) await get().loadPages(siteId);
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      // ---- Revisions ----
      loadRevisions: async (pageId: string) => {
        try {
          const revisions = await apiFetch<any[]>(
            `${API_BASE}/pages/${pageId}/revisions`
          );
          return revisions;
        } catch {
          return [];
        }
      },

      restoreRevision: async (pageId: string, revisionId: string) => {
        try {
          await apiFetch(
            `${API_BASE}/pages/${pageId}/revisions/${revisionId}/restore`,
            {
              method: 'POST',
            }
          );
          const siteId = get().currentSiteId;
          if (siteId) await get().loadPages(siteId);
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      // ---- SEO Analysis ----
      analyzeSEO: (page: Page) => {
        const issues: Array<{
          type: 'error' | 'warning' | 'pass';
          message: string;
        }> = [];
        const seo = page.seo ?? {};

        if (!seo.metaTitle || seo.metaTitle.length < 30) {
          issues.push({
            type: seo.metaTitle ? 'warning' : 'error',
            message: 'Meta title should be 30-60 characters',
          });
        }
        if (!seo.metaDescription || seo.metaDescription.length < 120) {
          issues.push({
            type: seo.metaDescription ? 'warning' : 'error',
            message: 'Meta description should be 120-160 characters',
          });
        }
        if (!seo.ogImage) {
          issues.push({
            type: 'warning',
            message: 'Open Graph image is recommended for social sharing',
          });
        }
        if (page.slug.length > 80) {
          issues.push({
            type: 'warning',
            message: 'URL slug is too long (max 80 characters)',
          });
        }
        if (!seo.focusKeyphrase) {
          issues.push({ type: 'warning', message: 'No focus keyphrase set' });
        }
        if (issues.length === 0) {
          issues.push({ type: 'pass', message: 'SEO looks good!' });
        }

        return {
          score: Math.max(
            0,
            100 - issues.filter((i) => i.type !== 'pass').length * 20
          ),
          issues,
        };
      },

      // ---- Webhooks ----
      loadWebhooks: async (siteId: string) => {
        try {
          return await apiFetch<any[]>(`${API_BASE}/${siteId}/webhooks`);
        } catch {
          return [];
        }
      },

      createWebhook: async (
        siteId: string,
        data: { name: string; url: string; events: string[] }
      ) => {
        try {
          await apiFetch(`${API_BASE}/${siteId}/webhooks`, {
            method: 'POST',
            body: JSON.stringify(data),
          });
        } catch (e: any) {
          set({ error: e.message });
        }
      },

      deleteWebhook: async (siteId: string, webhookId: string) => {
        try {
          await apiFetch(`${API_BASE}/${siteId}/webhooks/${webhookId}`, {
            method: 'DELETE',
          });
        } catch (e: any) {
          set({ error: e.message });
        }
      },
    }),
    {
      name: 'sukit-site-manager',
      partialize: (state) => ({
        sites: state.sites,
        currentSiteId: state.currentSiteId,
        currentPageId: state.currentPageId,
      }),
    }
  )
);
