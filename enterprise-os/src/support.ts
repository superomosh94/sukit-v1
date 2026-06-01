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
}
