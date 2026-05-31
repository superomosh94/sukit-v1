const API_BASE = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('sukit-auth-token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('sukit-auth-token', token);
    } else {
      localStorage.removeItem('sukit-auth-token');
    }
  }

  async request(endpoint, options = {}) {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    if (config.body instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, config);
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || `Request failed: ${response.status}`);
      }
      return response.status === 204 ? null : await response.json();
    } catch (error) {
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Network error: Unable to reach the server');
      }
      throw error;
    }
  }

  // Auth
  async login(email, password) {
    const data = await this.request('/auth/login', { method: 'POST', body: { email, password } });
    this.setToken(data.token);
    return data;
  }

  async register(email, password, name) {
    const data = await this.request('/auth/register', { method: 'POST', body: { email, password, name } });
    this.setToken(data.token);
    return data;
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' }).catch(() => {});
    this.setToken(null);
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async forgotPassword(email) {
    return this.request('/auth/forgot-password', { method: 'POST', body: { email } });
  }

  async resetPassword(token, newPassword) {
    return this.request('/auth/reset-password', { method: 'POST', body: { token, newPassword } });
  }

  // Sites
  async getSites() {
    return this.request('/sites');
  }

  async getSite(id) {
    return this.request(`/sites/${id}`);
  }

  async createSite(data) {
    return this.request('/sites', { method: 'POST', body: data });
  }

  async updateSite(id, data) {
    return this.request(`/sites/${id}`, { method: 'PUT', body: data });
  }

  async deleteSite(id) {
    return this.request(`/sites/${id}`, { method: 'DELETE' });
  }

  async getSiteSettings(siteId) {
    return this.request(`/sites/${siteId}/settings`);
  }

  async updateSiteSettings(siteId, settings) {
    return this.request(`/sites/${siteId}/settings`, { method: 'PUT', body: settings });
  }

  async getSitePages(siteId) {
    return this.request(`/sites/${siteId}/pages`);
  }

  async createSitePage(siteId, data) {
    return this.request(`/sites/${siteId}/pages`, { method: 'POST', body: data });
  }

  async getSitePage(siteId, pageId) {
    return this.request(`/sites/${siteId}/pages/${pageId}`);
  }

  async updateSitePage(siteId, pageId, data) {
    return this.request(`/sites/${siteId}/pages/${pageId}`, { method: 'PUT', body: data });
  }

  async deleteSitePage(siteId, pageId) {
    return this.request(`/sites/${siteId}/pages/${pageId}`, { method: 'DELETE' });
  }

  // Pages
  async getPage(pageId) {
    return this.request(`/pages/${pageId}`);
  }

  async updatePage(pageId, data) {
    return this.request(`/pages/${pageId}`, { method: 'PUT', body: data });
  }

  async publishPage(pageId) {
    return this.request(`/pages/${pageId}/publish`, { method: 'POST' });
  }

  async getPageRevisions(pageId) {
    return this.request(`/pages/${pageId}/revisions`);
  }

  async restoreRevision(pageId, version) {
    return this.request(`/pages/${pageId}/revisions`, { method: 'POST', body: { version } });
  }

  async createSection(pageId, data) {
    return this.request(`/pages/${pageId}/sections`, { method: 'POST', body: data });
  }

  async reorderSections(pageId, sections) {
    return this.request(`/pages/${pageId}/sections`, { method: 'PUT', body: { sections } });
  }

  async deleteSection(pageId, sectionId) {
    return this.request(`/pages/${pageId}/sections`, { method: 'DELETE', body: { sectionId } });
  }

  async updateBlock(pageId, blockId, data) {
    return this.request(`/pages/${pageId}/blocks/${blockId}`, { method: 'PUT', body: data });
  }

  async deleteBlock(pageId, blockId) {
    return this.request(`/pages/${pageId}/blocks/${blockId}`, { method: 'DELETE' });
  }

  // Media
  async uploadMedia(siteId, file) {
    const formData = new FormData();
    formData.append('file', file);
    return this.request(`/sites/${siteId}/media`, { method: 'POST', body: formData });
  }

  async getMedia(siteId) {
    return this.request(`/sites/${siteId}/media`);
  }

  async deleteMedia(siteId, mediaId) {
    return this.request(`/sites/${siteId}/media/${mediaId}`, { method: 'DELETE' });
  }

  async optimizeMedia(siteId, mediaId) {
    return this.request(`/sites/${siteId}/media/${mediaId}/optimize`, { method: 'POST' });
  }

  // Forms
  async submitForm(formId, data) {
    return this.request(`/forms/${formId}/submit`, { method: 'POST', body: data });
  }

  async getFormSubmissions(formId, params = {}) {
    const query = new URLSearchParams(params).toString();
    const qs = query ? `?${query}` : '';
    return this.request(`/forms/${formId}/submissions${qs}`);
  }

  async deleteFormSubmission(formId, submissionId) {
    return this.request(`/forms/${formId}/submissions/${submissionId}`, { method: 'DELETE' });
  }

  // Redirects
  async getRedirects(siteId) {
    return this.request(`/redirects?siteId=${siteId}`);
  }

  async createRedirect(data) {
    return this.request('/redirects', { method: 'POST', body: data });
  }

  async deleteRedirect(data) {
    return this.request('/redirects', { method: 'DELETE', body: data });
  }

  // Backups
  async getBackups(siteId) {
    return this.request(`/backups?siteId=${siteId}`);
  }

  async createBackup(data) {
    return this.request('/backups', { method: 'POST', body: data });
  }

  async deleteBackup(data) {
    return this.request('/backups', { method: 'DELETE', body: data });
  }

  async runBackup(data) {
    return this.request('/cron/run', { method: 'POST', body: data });
  }

  // Plugins (no backend yet)
  async getPlugins() {
    return this.request('/plugins');
  }

  async installPlugin(pluginId) {
    return this.request(`/plugins/${pluginId}/install`, { method: 'POST' });
  }

  async uninstallPlugin(pluginId) {
    return this.request(`/plugins/${pluginId}/uninstall`, { method: 'POST' });
  }

  // Templates (no backend yet)
  async getTemplates(category) {
    const query = category ? `?category=${category}` : '';
    return this.request(`/templates${query}`);
  }

  async saveTemplate(data) {
    return this.request('/templates', { method: 'POST', body: data });
  }

  async deleteTemplate(id) {
    return this.request(`/templates/${id}`, { method: 'DELETE' });
  }

  // Deployment / Export
  async deploySite(siteId) {
    return this.request(`/sites/${siteId}/export`, { method: 'POST' });
  }

  async getExport(siteId) {
    return this.request(`/export/${siteId}`);
  }

  async downloadExport(siteId) {
    return this.request(`/export/${siteId}/download`);
  }

  // Search
  async search(query) {
    return this.request(`/search?q=${encodeURIComponent(query)}`);
  }

  // Posts
  async getPosts(params = {}) {
    const query = new URLSearchParams(params).toString();
    const qs = query ? `?${query}` : '';
    return this.request(`/posts${qs}`);
  }

  async createPost(data) {
    return this.request('/posts', { method: 'POST', body: data });
  }

  async getPost(postId) {
    return this.request(`/posts/${postId}`);
  }

  async updatePost(postId, data) {
    return this.request(`/posts/${postId}`, { method: 'PUT', body: data });
  }

  async deletePost(postId) {
    return this.request(`/posts/${postId}`, { method: 'DELETE' });
  }

  async patchPost(postId, data) {
    return this.request(`/posts/${postId}`, { method: 'PATCH', body: data });
  }

  // Comments
  async getComments(params = {}) {
    const query = new URLSearchParams(params).toString();
    const qs = query ? `?${query}` : '';
    return this.request(`/comments${qs}`);
  }

  async createComment(data) {
    return this.request('/comments', { method: 'POST', body: data });
  }

  async updateComment(commentId, data) {
    return this.request(`/comments/${commentId}`, { method: 'PUT', body: data });
  }

  async deleteComment(commentId) {
    return this.request(`/comments/${commentId}`, { method: 'DELETE' });
  }

  async submitPublicComment(data) {
    return this.request('/comments/submit', { method: 'POST', body: data });
  }

  // Themes
  async getThemes() {
    return this.request('/themes');
  }

  async activateTheme(themeSlug) {
    return this.request('/themes', { method: 'POST', body: { action: 'activate', slug: themeSlug } });
  }

  // Options
  async getOptions(siteId) {
    return this.request(`/options?siteId=${siteId}`);
  }

  async setOption(key, value, siteId) {
    return this.request('/options', { method: 'POST', body: { key, value, siteId } });
  }

  async updateOption(optionId, data) {
    return this.request(`/options/${optionId}`, { method: 'PUT', body: data });
  }

  async deleteOption(optionId) {
    return this.request(`/options/${optionId}`, { method: 'DELETE' });
  }

  // Widget Areas
  async getWidgetAreas(siteId) {
    return this.request(`/widget-areas?siteId=${siteId}`);
  }

  async createWidgetArea(data) {
    return this.request('/widget-areas', { method: 'POST', body: data });
  }

  async updateWidgetArea(areaId, data) {
    return this.request(`/widget-areas/${areaId}`, { method: 'PUT', body: data });
  }

  async deleteWidgetArea(areaId) {
    return this.request(`/widget-areas/${areaId}`, { method: 'DELETE' });
  }

  // WebSocket
  connectWebSocket(projectId, onMessage) {
    const wsBase = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
    const ws = new WebSocket(`${wsBase}?projectId=${projectId}&token=${this.token}`);

    ws.onopen = () => console.log('WebSocket connected');
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (e) {
        console.error('WebSocket message parse error:', e);
      }
    };
    ws.onerror = (error) => console.error('WebSocket error:', error);
    ws.onclose = () => console.log('WebSocket disconnected');

    return {
      send: (data) => ws.readyState === WebSocket.OPEN && ws.send(JSON.stringify(data)),
      close: () => ws.close(),
      ws,
    };
  }
}

export const api = new ApiService();
export default api;
