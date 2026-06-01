import type { SukitKernel } from '@sukit/core';

type SupportTier = 'standard' | 'premium' | 'enterprise';
type SeverityLevel = 'P0' | 'P1' | 'P2' | 'P3' | 'P4';
type TicketStatus =
  | 'new'
  | 'assigned'
  | 'in-progress'
  | 'pending-customer'
  | 'resolved'
  | 'closed';

interface SLAResponse {
  severity: SeverityLevel;
  initialResponse: number;
  updateFrequency: number;
  resolutionTarget: number;
  escalationAfter: number;
}

interface SupportEngineer {
  id: string;
  name: string;
  email: string;
  avatar: string;
  skills: string[];
  expertise: string[];
  currentLoad: number;
  maxLoad: number;
  timezone: string;
  availability: { day: string; start: string; end: string }[];
}

interface EnterpriseTicket {
  id: string;
  orgId: string;
  orgName: string;
  severity: SeverityLevel;
  status: TicketStatus;
  subject: string;
  description: string;
  assignee: SupportEngineer | null;
  slaDeadline: string | null;
  escalatedAt: string | null;
  resolution: string | null;
  customerHealthScore: number;
  createdAt: string;
  updatedAt: string;
}

interface CustomerHealth {
  orgId: string;
  orgName: string;
  score: number;
  trend: 'improving' | 'stable' | 'declining';
  openTickets: number;
  avgResponseTime: number;
  npsScore: number | null;
  lastQBR: string | null;
  usageGrowth: number;
  churnRisk: 'low' | 'medium' | 'high';
  featuresUsed: string[];
  lastActivity: string;
}

export class EnterpriseSupportPortal {
  private kernel: SukitKernel;
  private tickets: EnterpriseTicket[] = [];
  private engineers: SupportEngineer[] = [];
  private healthRecords: Map<string, CustomerHealth> = new Map();

  constructor(kernel: SukitKernel) {
    this.kernel = kernel;
    this.initEngineers();
  }

  private initEngineers(): void {
    this.engineers = [
      {
        id: 'eng_1',
        name: 'Alice Chen',
        email: 'alice@sukit.dev',
        avatar: '',
        skills: ['infrastructure', 'security'],
        expertise: ['AWS', 'K8s', 'PostgreSQL'],
        currentLoad: 3,
        maxLoad: 8,
        timezone: 'America/New_York',
        availability: [
          { day: 'monday', start: '09:00', end: '17:00' },
          { day: 'tuesday', start: '09:00', end: '17:00' },
          { day: 'wednesday', start: '09:00', end: '17:00' },
          { day: 'thursday', start: '09:00', end: '17:00' },
          { day: 'friday', start: '09:00', end: '17:00' },
        ],
      },
      {
        id: 'eng_2',
        name: 'Bob Martinez',
        email: 'bob@sukit.dev',
        avatar: '',
        skills: ['frontend', 'modules'],
        expertise: ['React', 'TypeScript', 'Visual Builder'],
        currentLoad: 5,
        maxLoad: 8,
        timezone: 'America/Chicago',
        availability: [
          { day: 'monday', start: '08:00', end: '16:00' },
          { day: 'tuesday', start: '08:00', end: '16:00' },
          { day: 'wednesday', start: '08:00', end: '16:00' },
          { day: 'thursday', start: '08:00', end: '16:00' },
          { day: 'friday', start: '08:00', end: '16:00' },
        ],
      },
      {
        id: 'eng_3',
        name: 'Carol Smith',
        email: 'carol@sukit.dev',
        avatar: '',
        skills: ['backend', 'api', 'database'],
        expertise: ['Node.js', 'PostgreSQL', 'Redis', 'API Design'],
        currentLoad: 2,
        maxLoad: 8,
        timezone: 'Europe/London',
        availability: [
          { day: 'monday', start: '08:00', end: '16:00' },
          { day: 'tuesday', start: '08:00', end: '16:00' },
          { day: 'wednesday', start: '08:00', end: '16:00' },
          { day: 'thursday', start: '08:00', end: '16:00' },
          { day: 'friday', start: '08:00', end: '16:00' },
        ],
      },
    ];
  }

  private slaTargets: Record<SupportTier, SLAResponse[]> = {
    standard: [
      {
        severity: 'P0',
        initialResponse: 3600,
        updateFrequency: 14400,
        resolutionTarget: 86400,
        escalationAfter: 14400,
      },
      {
        severity: 'P1',
        initialResponse: 14400,
        updateFrequency: 28800,
        resolutionTarget: 172800,
        escalationAfter: 43200,
      },
      {
        severity: 'P2',
        initialResponse: 28800,
        updateFrequency: 86400,
        resolutionTarget: 432000,
        escalationAfter: 172800,
      },
      {
        severity: 'P3',
        initialResponse: 86400,
        updateFrequency: 172800,
        resolutionTarget: 864000,
        escalationAfter: 432000,
      },
      {
        severity: 'P4',
        initialResponse: 172800,
        updateFrequency: 259200,
        resolutionTarget: 1209600,
        escalationAfter: 604800,
      },
    ],
    premium: [
      {
        severity: 'P0',
        initialResponse: 900,
        updateFrequency: 3600,
        resolutionTarget: 14400,
        escalationAfter: 7200,
      },
      {
        severity: 'P1',
        initialResponse: 3600,
        updateFrequency: 7200,
        resolutionTarget: 43200,
        escalationAfter: 14400,
      },
      {
        severity: 'P2',
        initialResponse: 7200,
        updateFrequency: 14400,
        resolutionTarget: 86400,
        escalationAfter: 43200,
      },
      {
        severity: 'P3',
        initialResponse: 14400,
        updateFrequency: 43200,
        resolutionTarget: 259200,
        escalationAfter: 86400,
      },
      {
        severity: 'P4',
        initialResponse: 43200,
        updateFrequency: 86400,
        resolutionTarget: 432000,
        escalationAfter: 172800,
      },
    ],
    enterprise: [
      {
        severity: 'P0',
        initialResponse: 300,
        updateFrequency: 1800,
        resolutionTarget: 7200,
        escalationAfter: 3600,
      },
      {
        severity: 'P1',
        initialResponse: 900,
        updateFrequency: 3600,
        resolutionTarget: 14400,
        escalationAfter: 7200,
      },
      {
        severity: 'P2',
        initialResponse: 3600,
        updateFrequency: 7200,
        resolutionTarget: 43200,
        escalationAfter: 14400,
      },
      {
        severity: 'P3',
        initialResponse: 7200,
        updateFrequency: 14400,
        resolutionTarget: 86400,
        escalationAfter: 43200,
      },
      {
        severity: 'P4',
        initialResponse: 14400,
        updateFrequency: 43200,
        resolutionTarget: 259200,
        escalationAfter: 86400,
      },
    ],
  };

  getSLATargets(tier: SupportTier): SLAResponse[] {
    return this.slaTargets[tier];
  }

  getEngineers(): SupportEngineer[] {
    return this.engineers;
  }

  getAvailableEngineers(): SupportEngineer[] {
    return this.engineers.filter((e) => e.currentLoad < e.maxLoad);
  }

  createTicket(
    orgId: string,
    orgName: string,
    severity: SeverityLevel,
    subject: string,
    description: string
  ): EnterpriseTicket {
    const engineer =
      this.getAvailableEngineers().sort(
        (a, b) => a.currentLoad - b.currentLoad
      )[0] || null;
    const ticket: EnterpriseTicket = {
      id: `tkt_${crypto.randomUUID().substring(0, 12)}`,
      orgId,
      orgName,
      severity,
      status: 'new',
      subject,
      description,
      assignee: engineer,
      slaDeadline: null,
      escalatedAt: null,
      resolution: null,
      customerHealthScore: this.getCustomerHealth(orgId)?.score || 50,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (engineer) {
      engineer.currentLoad++;
      ticket.status = 'assigned';
    }
    this.tickets.push(ticket);
    return ticket;
  }

  getTickets(orgId?: string): EnterpriseTicket[] {
    return orgId ? this.tickets.filter((t) => t.orgId === orgId) : this.tickets;
  }

  assignTicket(ticketId: string, engineerId: string): boolean {
    const ticket = this.tickets.find((t) => t.id === ticketId);
    const engineer = this.engineers.find((e) => e.id === engineerId);
    if (!ticket || !engineer || engineer.currentLoad >= engineer.maxLoad)
      return false;
    if (ticket.assignee) ticket.assignee.currentLoad--;
    ticket.assignee = engineer;
    ticket.status = 'assigned';
    engineer.currentLoad++;
    return true;
  }

  escalateTicket(ticketId: string, reason: string): boolean {
    const ticket = this.tickets.find((t) => t.id === ticketId);
    if (!ticket) return false;
    ticket.escalatedAt = new Date().toISOString();
    ticket.severity =
      ticket.severity === 'P2'
        ? 'P1'
        : ticket.severity === 'P1'
          ? 'P0'
          : ticket.severity;
    return true;
  }

  resolveTicket(ticketId: string, resolution: string): boolean {
    const ticket = this.tickets.find((t) => t.id === ticketId);
    if (!ticket) return false;
    ticket.status = 'resolved';
    ticket.resolution = resolution;
    if (ticket.assignee)
      ticket.assignee.currentLoad = Math.max(
        0,
        ticket.assignee.currentLoad - 1
      );
    return true;
  }

  // ─── Customer Health ───────────────────────────────────────────

  setCustomerHealth(
    orgId: string,
    orgName: string,
    data: Partial<CustomerHealth>
  ): CustomerHealth {
    const existing = this.getCustomerHealth(orgId) || {
      orgId,
      orgName,
      score: 50,
      trend: 'stable',
      openTickets: 0,
      avgResponseTime: 0,
      npsScore: null,
      lastQBR: null,
      usageGrowth: 0,
      churnRisk: 'low',
      featuresUsed: [],
      lastActivity: new Date().toISOString(),
    };
    const updated: CustomerHealth = {
      ...existing,
      ...data,
      lastActivity: new Date().toISOString(),
    };
    this.healthRecords.set(orgId, updated);
    return updated;
  }

  getCustomerHealth(orgId: string): CustomerHealth | undefined {
    return this.healthRecords.get(orgId);
  }

  getAtRiskCustomers(threshold = 40): CustomerHealth[] {
    return Array.from(this.healthRecords.values())
      .filter((h) => h.score < threshold)
      .sort((a, b) => a.score - b.score);
  }

  // ─── QBR (Quarterly Business Review) ───────────────────────────

  generateQBRReport(orgId: string): {
    executive: string;
    metrics: Record<string, any>;
    recommendations: string[];
    nextSteps: string[];
  } {
    return {
      executive: `${orgId} has shown strong adoption of SUKIT platform features.`,
      metrics: {
        sitesCreated: 12,
        pagesPublished: 145,
        modulesInstalled: 8,
        supportTickets: 5,
        averageRating: 4.2,
        uptime: 99.997,
      },
      recommendations: [
        'Upgrade to Enterprise plan for SSO',
        'Enable audit logging for compliance',
        'Schedule training for team',
      ],
      nextSteps: [
        'Schedule next QBR',
        'Review upcoming features',
        'Plan migration strategy',
      ],
    };
  }

  scheduleQBRSession(
    orgId: string,
    date: string
  ): { sessionId: string; date: string; agenda: string[] } {
    return {
      sessionId: crypto.randomUUID(),
      date,
      agenda: [
        'Platform adoption review',
        'Support metrics',
        'Product roadmap',
        'Feature requests',
        'Contract renewal discussion',
      ],
    };
  }

  // ─── Support Engineer Scheduling ───────────────────────────

  private schedules: Map<string, { date: string; shifts: { engineerId: string; start: string; end: string; type: 'oncall' | 'regular' | 'overflow' }[] }> = new Map();

  createSchedule(date: string, shifts: { engineerId: string; start: string; end: string; type: 'oncall' | 'regular' | 'overflow' }[]): void {
    this.schedules.set(date, { date, shifts });
  }

  getSchedule(date: string): { engineerId: string; engineerName: string; start: string; end: string; type: string }[] {
    const schedule = this.schedules.get(date);
    if (!schedule) return [];
    return schedule.shifts.map(s => ({
      engineerId: s.engineerId,
      engineerName: this.engineers.find(e => e.id === s.engineerId)?.name || 'Unknown',
      start: s.start,
      end: s.end,
      type: s.type,
    }));
  }

  getCoverage(date: string, time: string): SupportEngineer[] {
    return this.engineers.filter(e => {
      const avail = e.availability.find(a =>
        a.day.toLowerCase() === new Date(date).toLocaleDateString('en', { weekday: 'long' }).toLowerCase()
      );
      if (!avail) return false;
      return time >= avail.start && time <= avail.end && e.currentLoad < e.maxLoad;
    });
  }

  autoAssignShift(date: string, time: string, type: 'oncall' | 'regular' = 'regular'): boolean {
    const available = this.getCoverage(date, time);
    if (available.length === 0) return false;
    const engineer = available.sort((a, b) => a.currentLoad - b.currentLoad)[0];
    const dateKey = date.substring(0, 10);
    if (!this.schedules.has(dateKey)) this.schedules.set(dateKey, { date: dateKey, shifts: [] });
    const schedule = this.schedules.get(dateKey)!;
    schedule.shifts.push({ engineerId: engineer.id, start: time, end: this.addHours(time, 8), type });
    return true;
  }

  private addHours(time: string, hours: number): string {
    const [h, m] = time.split(':').map(Number);
    return `${String((h + hours) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  // ─── Feature Voting Portal ─────────────────────────────────

  private featureRequests: Map<string, { id: string; title: string; description: string; category: string; votes: number; voters: string[]; status: 'under-review' | 'planned' | 'in-progress' | 'shipped' | 'declined'; createdAt: string; orgId: string }> = new Map();

  submitFeatureRequest(orgId: string, title: string, description: string, category: string): { id: string } {
    const id = `fr_${crypto.randomUUID().substring(0, 8)}`;
    this.featureRequests.set(id, { id, title, description, category, votes: 0, voters: [], status: 'under-review', createdAt: new Date().toISOString(), orgId });
    return { id };
  }

  getFeatureRequests(orgId?: string): { id: string; title: string; description: string; category: string; votes: number; status: string; createdAt: string }[] {
    const requests = Array.from(this.featureRequests.values());
    const filtered = orgId ? requests.filter(r => r.orgId === orgId) : requests;
    return filtered.sort((a, b) => b.votes - a.votes);
  }

  voteFeature(requestId: string, userId: string): { success: boolean; totalVotes: number } {
    const request = this.featureRequests.get(requestId);
    if (!request) return { success: false, totalVotes: 0 };
    if (request.voters.includes(userId)) return { success: false, totalVotes: request.votes };
    request.voters.push(userId);
    request.votes++;
    return { success: true, totalVotes: request.votes };
  }

  updateFeatureStatus(requestId: string, status: 'under-review' | 'planned' | 'in-progress' | 'shipped' | 'declined'): boolean {
    const request = this.featureRequests.get(requestId);
    if (!request) return false;
    request.status = status;
    return true;
  }

  generateFeaturePortalHtml(): string {
    return `import { useState, useEffect } from 'react';

export function FeaturePortal({ orgId }: { orgId: string }) {
  const [requests, setRequests] = useState([]);
  const [showSubmit, setShowSubmit] = useState(false);

  useEffect(() => {
    fetch('/api/features?orgId=' + orgId).then(r => r.json()).then(setRequests);
  }, [orgId]);

  const submitFeature = async () => {
    const title = (document.getElementById('feature-title') as HTMLInputElement).value;
    const desc = (document.getElementById('feature-desc') as HTMLTextAreaElement).value;
    const cat = (document.getElementById('feature-cat') as HTMLSelectElement).value;
    const res = await fetch('/api/features', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgId, title, description: desc, category: cat }),
    });
    const data = await res.json();
    setRequests([data, ...requests]);
    setShowSubmit(false);
  };

  const vote = async (id: string) => {
    await fetch('/api/features/' + id + '/vote', { method: 'POST' });
    setRequests(requests.map(r => r.id === id ? { ...r, votes: r.votes + 1 } : r));
  };

  return (
    <div className="feature-portal">
      <header><h2>Feature Requests</h2><button onClick={() => setShowSubmit(true)}>Submit Idea</button></header>
      {showSubmit && (
        <div className="submit-form">
          <input id="feature-title" placeholder="Feature title" />
          <textarea id="feature-desc" placeholder="Describe the feature..." />
          <select id="feature-cat"><option value="builder">Builder</option><option value="modules">Modules</option><option value="analytics">Analytics</option><option value="infrastructure">Infrastructure</option></select>
          <button onClick={submitFeature}>Submit</button>
          <button onClick={() => setShowSubmit(false)}>Cancel</button>
        </div>
      )}
      <div className="requests-list">
        {requests.map(r => (
          <div key={r.id} className="request-card">
            <div className="vote-section"><button onClick={() => vote(r.id)}>▲</button><span>{r.votes}</span></div>
            <div className="request-content"><h3>{r.title}</h3><p>{r.description}</p></div>
            <div className="request-meta"><span className={'status ' + r.status}>{r.status}</span><span>{r.category}</span></div>
          </div>
        ))}
      </div>
      <style>{`
        .feature-portal { padding: 24px; font-family: -apple-system, sans-serif; }
        header { display: flex; justify-content: space-between; margin-bottom: 16px; }
        .submit-form { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; padding: 16px; background: #f9fafb; border-radius: 8px; }
        .submit-form input, .submit-form textarea, .submit-form select { padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; }
        .submit-form button { padding: 8px; background: #4F46E5; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
        .request-card { display: flex; gap: 16px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 8px; }
        .vote-section { display: flex; flex-direction: column; align-items: center; min-width: 40px; }
        .vote-section button { background: none; border: 1px solid #d1d5db; border-radius: 4px; cursor: pointer; padding: 4px 8px; }
        .request-content { flex: 1; }
        .request-content h3 { margin: 0 0 4px; font-size: 16px; }
        .request-content p { margin: 0; font-size: 13px; color: #666; }
        .request-meta { display: flex; flex-direction: column; gap: 4px; align-items: flex-end; }
        .status { font-size: 11px; padding: 2px 6px; border-radius: 4px; }
        .status.under-review { background: #FEF3C7; color: #D97706; }
        .status.planned { background: #DBEAFE; color: #2563EB; }
        .status.in-progress { background: #D1FAE5; color: #059669; }
        .status.shipped { background: #D1FAE5; color: #059669; }
      `}</style>
    </div>
  );
}`;
  }

  // ─── Product Roadmap Access ────────────────────────────────

  generateRoadmap(): { quarter: string; items: { id: string; title: string; description: string; category: string; status: 'planned' | 'in-development' | 'beta' | 'launched'; eta: string; voterCount: number }[] }[] {
    return [
      {
        quarter: 'Q1 2026',
        items: [
          { id: 'rm-1', title: 'AI-Powered Content Generation', description: 'Generate page content using AI', category: 'builder', status: 'launched', eta: '2026-01', voterCount: 234 },
          { id: 'rm-2', title: 'Multi-Language Sites', description: 'Create sites in multiple languages', category: 'i18n', status: 'launched', eta: '2026-02', voterCount: 189 },
          { id: 'rm-3', title: 'Advanced Analytics Dashboard', description: 'Enhanced analytics with custom reports', category: 'analytics', status: 'launched', eta: '2026-03', voterCount: 156 },
        ],
      },
      {
        quarter: 'Q2 2026',
        items: [
          { id: 'rm-4', title: 'Real-Time Collaboration', description: 'Multi-user editing in the builder', category: 'builder', status: 'beta', eta: '2026-04', voterCount: 312 },
          { id: 'rm-5', title: 'Form Builder 2.0', description: 'Advanced form builder with conditional logic', category: 'modules', status: 'in-development', eta: '2026-05', voterCount: 198 },
          { id: 'rm-6', title: 'E-Commerce Module', description: 'Full e-commerce capabilities', category: 'commerce', status: 'in-development', eta: '2026-06', voterCount: 267 },
        ],
      },
      {
        quarter: 'Q3 2026',
        items: [
          { id: 'rm-7', title: 'Custom Theme Builder', description: 'Visual theme customization', category: 'builder', status: 'planned', eta: '2026-07', voterCount: 145 },
          { id: 'rm-8', title: 'API Rate Limit Dashboard', description: 'Monitor and manage API usage', category: 'infrastructure', status: 'planned', eta: '2026-08', voterCount: 89 },
          { id: 'rm-9', title: 'Enterprise SSO Directory Sync', description: 'Automated user provisioning from AD/LDAP', category: 'enterprise', status: 'planned', eta: '2026-09', voterCount: 123 },
        ],
      },
      {
        quarter: 'Q4 2026',
        items: [
          { id: 'rm-10', title: 'Mobile App Builder', description: 'Build mobile apps from sites', category: 'builder', status: 'planned', eta: '2026-10', voterCount: 201 },
          { id: 'rm-11', title: 'Compliance Automation', description: 'Automated SOC2/HIPAA evidence collection', category: 'enterprise', status: 'planned', eta: '2026-11', voterCount: 78 },
          { id: 'rm-12', title: 'Global CDN with Edge Functions', description: 'Serverless edge computing', category: 'infrastructure', status: 'planned', eta: '2026-12', voterCount: 112 },
        ],
      },
    ];
  }

  getRoadmapItem(itemId: string): { quarter: string; item: any } | null {
    for (const q of this.generateRoadmap()) {
      const item = q.items.find(i => i.id === itemId);
      if (item) return { quarter: q.quarter, item };
    }
    return null;
  }

  generateRoadmapHtml(): string {
    const roadmap = this.generateRoadmap();
    return `import { useState } from 'react';

const ROADMAP = ${JSON.stringify(roadmap, null, 2)};

export function Roadmap() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="roadmap">
      <header><h1>Product Roadmap</h1><p>See what's coming next to SUKIT</p></header>
      <div className="quarters">
        {ROADMAP.map(q => (
          <div key={q.quarter} className="quarter">
            <h2>{q.quarter}</h2>
            <div className="items">
              {q.items.map(item => (
                <div key={item.id} className={'roadmap-item ' + item.status} onClick={() => setExpanded(expanded === item.id ? null : item.id)}>
                  <div className="item-header">
                    <span className={'status-badge ' + item.status}>{item.status}</span>
                    <h3>{item.title}</h3>
                    <span className="votes">{item.voterCount} votes</span>
                  </div>
                  {expanded === item.id && (
                    <div className="item-details">
                      <p>{item.description}</p>
                      <span className="eta">ETA: {item.eta}</span>
                      <span className="category">{item.category}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <style>{`
        .roadmap { padding: 24px; font-family: -apple-system, sans-serif; max-width: 900px; margin: 0 auto; }
        header { text-align: center; margin-bottom: 32px; }
        header h1 { margin: 0; color: #4F46E5; }
        .quarter { margin-bottom: 32px; }
        .quarter h2 { font-size: 18px; color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; }
        .roadmap-item { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 16px; margin-bottom: 8px; cursor: pointer; transition: box-shadow 0.2s; }
        .roadmap-item:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .item-header { display: flex; align-items: center; gap: 12px; }
        .item-header h3 { margin: 0; font-size: 15px; flex: 1; }
        .status-badge { font-size: 10px; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; font-weight: 600; }
        .status-badge.launched { background: #D1FAE5; color: #059669; }
        .status-badge.beta { background: #DBEAFE; color: #2563EB; }
        .status-badge.in-development { background: #FEF3C7; color: #D97706; }
        .status-badge.planned { background: #F3F4F6; color: #6B7280; }
        .votes { font-size: 12px; color: #6B7280; }
        .item-details { margin-top: 12px; padding-top: 12px; border-top: 1px solid #f3f4f6; }
        .item-details p { margin: 0 0 8px; font-size: 13px; color: #666; }
        .eta { font-size: 12px; color: #4F46E5; margin-right: 12px; }
        .category { font-size: 12px; background: #EEF2FF; padding: 2px 6px; border-radius: 4px; color: #4F46E5; }
      `}</style>
    </div>
  );
}`;
  }
}
