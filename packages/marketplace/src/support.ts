import type { SukitKernel } from '@sukit/core';
import type {
  TicketData,
  TicketResponseData,
  KnowledgeBaseArticleData,
  KnowledgeBaseSearchResult,
  TicketPriority,
  TicketCategory,
  TicketStatus,
} from './types';

export class SupportSystem {
  private kernel: SukitKernel;

  constructor(kernel: SukitKernel) {
    this.kernel = kernel;
  }

  // ─── Ticket System (Category 10.1) ─────────────────────────────

  async createTicket(data: {
    moduleId: string;
    subject: string;
    message: string;
    priority?: TicketPriority;
    category?: TicketCategory;
    attachments?: File[];
  }): Promise<TicketData> {
    const formData = new FormData();
    formData.append('moduleId', data.moduleId);
    formData.append('subject', data.subject);
    formData.append('message', data.message);
    if (data.priority) formData.append('priority', data.priority);
    if (data.category) formData.append('category', data.category);
    if (data.attachments) {
      data.attachments.forEach((f) => formData.append('attachments', f));
    }

    const res = await fetch('/api/support/tickets', {
      method: 'POST',
      body: formData,
    });
    const ticket = await res.json();

    await this.kernel.events.emit('marketplace:newSupportTicket', {
      moduleId: data.moduleId,
      ticketId: ticket.id,
    });

    return ticket;
  }

  async getTickets(options?: {
    status?: TicketStatus;
    priority?: TicketPriority;
    moduleId?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ tickets: TicketData[]; total: number; page: number }> {
    const params = new URLSearchParams();
    if (options?.status) params.set('status', options.status);
    if (options?.priority) params.set('priority', options.priority);
    if (options?.moduleId) params.set('moduleId', options.moduleId);
    params.set('page', String(options?.page ?? 1));
    params.set('pageSize', String(options?.pageSize ?? 20));

    const res = await fetch(`/api/support/tickets?${params}`);
    return res.json();
  }

  async getTicket(ticketId: string): Promise<TicketData> {
    const res = await fetch(`/api/support/tickets/${ticketId}`);
    return res.json();
  }

  async addResponse(
    ticketId: string,
    message: string,
    attachments?: File[]
  ): Promise<TicketResponseData> {
    const formData = new FormData();
    formData.append('message', message);
    formData.append('authorType', 'customer');
    if (attachments) {
      attachments.forEach((f) => formData.append('attachments', f));
    }

    const res = await fetch(`/api/support/tickets/${ticketId}/response`, {
      method: 'POST',
      body: formData,
    });
    return res.json();
  }

  async resolveTicket(ticketId: string): Promise<void> {
    await fetch(`/api/support/tickets/${ticketId}/resolve`, {
      method: 'PUT',
    });
  }

  async reopenTicket(ticketId: string, reason: string): Promise<void> {
    await fetch(`/api/support/tickets/${ticketId}/reopen`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async closeTicket(ticketId: string): Promise<void> {
    await fetch(`/api/support/tickets/${ticketId}/close`, {
      method: 'PUT',
    });
  }

  // ─── Developer Response (Category 10.2) ────────────────────────

  async respondAsDeveloper(
    ticketId: string,
    message: string,
    privateNote?: string
  ): Promise<TicketResponseData> {
    const res = await fetch(`/api/support/tickets/${ticketId}/response`, {
      method: 'POST',
      body: JSON.stringify({ message, privateNote, authorType: 'developer' }),
    });
    return res.json();
  }

  async getPrivateNotes(
    ticketId: string
  ): Promise<{
    notes: { authorId: string; note: string; createdAt: string }[];
  }> {
    const res = await fetch(`/api/support/tickets/${ticketId}/private-notes`);
    return res.json();
  }

  async addPrivateNote(ticketId: string, note: string): Promise<void> {
    await fetch(`/api/support/tickets/${ticketId}/private-notes`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
  }

  async escalateTicket(ticketId: string, reason: string): Promise<void> {
    await fetch(`/api/support/tickets/${ticketId}/escalate`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async getResponseTemplates(): Promise<{
    templates: {
      id: string;
      title: string;
      content: string;
      category: string;
    }[];
  }> {
    const res = await fetch('/api/support/templates');
    return res.json();
  }

  async requestMoreInfo(ticketId: string, questions: string[]): Promise<void> {
    await fetch(`/api/support/tickets/${ticketId}/request-info`, {
      method: 'POST',
      body: JSON.stringify({ questions }),
    });
  }

  // ─── Customer Notifications (Category 10.3) ───────────────────

  async submitSatisfactionSurvey(
    ticketId: string,
    score: number,
    feedback?: string
  ): Promise<void> {
    await fetch(`/api/support/tickets/${ticketId}/satisfaction`, {
      method: 'POST',
      body: JSON.stringify({ score, feedback }),
    });
  }

  async getTicketHistory(): Promise<{
    tickets: TicketData[];
    averageResponseTime: number;
    satisfactionScore: number;
    resolutionRate: number;
  }> {
    const res = await fetch('/api/support/tickets/history');
    return res.json();
  }

  // ─── Knowledge Base (Category 10.4) ────────────────────────────

  async searchKnowledgeBase(
    query: string,
    category?: string
  ): Promise<KnowledgeBaseSearchResult> {
    const params = new URLSearchParams({ query });
    if (category) params.set('category', category);
    const res = await fetch(`/api/support/kb/search?${params}`);
    return res.json();
  }

  async getKnowledgeBaseArticles(category?: string): Promise<{
    articles: KnowledgeBaseArticleData[];
    categories: { name: string; count: number }[];
  }> {
    const params = category ? `?category=${encodeURIComponent(category)}` : '';
    const res = await fetch(`/api/support/kb${params}`);
    return res.json();
  }

  async getKnowledgeBaseArticle(
    slug: string
  ): Promise<KnowledgeBaseArticleData> {
    const res = await fetch(`/api/support/kb/${slug}`);
    return res.json();
  }

  async getRelatedArticles(
    articleId: string
  ): Promise<KnowledgeBaseArticleData[]> {
    const res = await fetch(`/api/support/kb/${articleId}/related`);
    return res.json();
  }

  async voteArticle(articleId: string, helpful: boolean): Promise<void> {
    await fetch(`/api/support/kb/${articleId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ helpful }),
    });
  }

  // ─── Admin: Knowledge Base Management ─────────────────────────

  async createArticle(data: {
    title: string;
    content: string;
    excerpt?: string;
    category: string;
    tags?: string[];
  }): Promise<KnowledgeBaseArticleData> {
    const res = await fetch('/api/admin/support/kb', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  }

  async updateArticle(
    articleId: string,
    data: Partial<{
      title: string;
      content: string;
      excerpt: string;
      category: string;
      tags: string[];
      published: boolean;
    }>
  ): Promise<KnowledgeBaseArticleData> {
    const res = await fetch(`/api/admin/support/kb/${articleId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.json();
  }

  async deleteArticle(articleId: string): Promise<void> {
    await fetch(`/api/admin/support/kb/${articleId}`, {
      method: 'DELETE',
    });
  }

  async getArticleStats(): Promise<{
    totalArticles: number;
    totalViews: number;
    helpfulPercentage: number;
    topArticles: { title: string; views: number; helpful: number }[];
    articlesByCategory: { category: string; count: number }[];
  }> {
    const res = await fetch('/api/admin/support/kb/stats');
    return res.json();
  }

  // ─── Admin: Ticket Management ──────────────────────────────────

  async getAllTickets(options?: {
    status?: TicketStatus;
    priority?: TicketPriority;
    assignedTo?: string;
    page?: number;
  }): Promise<{
    tickets: TicketData[];
    total: number;
    queue: { open: number; inProgress: number; urgent: number };
  }> {
    const params = new URLSearchParams();
    if (options?.status) params.set('status', options.status);
    if (options?.priority) params.set('priority', options.priority);
    if (options?.assignedTo) params.set('assignedTo', options.assignedTo);
    params.set('page', String(options?.page ?? 1));

    const res = await fetch(`/api/admin/support/tickets?${params}`);
    return res.json();
  }

  async assignTicket(ticketId: string, assigneeId: string): Promise<void> {
    await fetch(`/api/admin/support/tickets/${ticketId}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ assigneeId }),
    });
  }

  async getTicketStats(): Promise<{
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    averageResponseTime: number;
    averageResolutionTime: number;
    satisfactionScore: number;
    ticketsByDay: { date: string; opened: number; resolved: number }[];
  }> {
    const res = await fetch('/api/admin/support/stats');
    return res.json();
  }
}
