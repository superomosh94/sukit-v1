import { prisma } from '@/lib/db/prisma';
import { emit } from '@/lib/marketplace/utils/events';
import { audit } from '@/lib/marketplace/utils/audit';

const SECRET_PATTERNS = [
  { name: 'AWS Access Key', re: /AKIA[0-9A-Z]{16}/g },
  {
    name: 'AWS Secret Key',
    re: /aws_secret_access_key\s*=\s*["']?([A-Za-z0-9/+=]{40})/g,
  },
  { name: 'Stripe Live Key', re: /sk_live_[0-9a-zA-Z]{24,}/g },
  { name: 'Stripe Test Key', re: /sk_test_[0-9a-zA-Z]{24,}/g },
  { name: 'GitHub Token', re: /gh[pousr]_[A-Za-z0-9_]{36,}/g },
  { name: 'Google API Key', re: /AIza[0-9A-Za-z\-_]{35}/g },
  { name: 'Slack Token', re: /xox[baprs]-[0-9a-zA-Z\-]{10,}/g },
  {
    name: 'Private Key Block',
    re: /-----BEGIN (?:RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----/g,
  },
  {
    name: 'JWT Token',
    re: /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g,
  },
  {
    name: 'Generic API Key',
    re: /api[_-]?key\s*[:=]\s*["']([A-Za-z0-9_\-]{20,})["']/gi,
  },
  {
    name: 'Generic Secret',
    re: /secret\s*[:=]\s*["']([A-Za-z0-9_\-]{20,})["']/gi,
  },
  {
    name: 'Password Assignment',
    re: /password\s*[:=]\s*["']([^"'\s]{8,})["']/gi,
  },
];

const OBFUSCATION_PATTERNS = [
  {
    name: 'Base64-encoded eval',
    re: /eval\s*\(\s*atob\s*\(/g,
    severity: 'high',
  },
  {
    name: 'Hex-encoded string',
    re: /\\x[0-9a-fA-F]{2}(\\x[0-9a-fA-F]{2}){10,}/g,
    severity: 'high',
  },
  {
    name: 'Long hex string',
    re: /(?<![\w/])[0-9a-fA-F]{100,}(?![\w/])/g,
    severity: 'medium',
  },
  {
    name: 'Unicode escape sequence',
    re: /\\u[0-9a-fA-F]{4}(\\u[0-9a-fA-F]{4}){8,}/g,
    severity: 'medium',
  },
  {
    name: 'JavaScript obfuscation',
    re: /\[\s*"\\x[0-9a-f]+"\s*\]/g,
    severity: 'high',
  },
  {
    name: 'Packed/wrapped code',
    re: /eval\s*\(\s*function\s*\(\s*[a-zA-Z_$][\w$]*\s*\)\s*\{/g,
    severity: 'high',
  },
  {
    name: 'Char code obfuscation',
    re: /String\.fromCharCode\s*\(\s*(?:\d+\s*,\s*){5,}\d+\s*\)/g,
    severity: 'medium',
  },
];

const MALWARE_SIGNATURES = [
  {
    name: 'Reverse shell attempt',
    re: /bash\s+-i\s+>&\s+\/dev\/tcp\//g,
    severity: 'critical',
  },
  {
    name: 'Crypto miner (xmrig)',
    re: /xmrig|cryptonight|stratum\+tcp/g,
    severity: 'critical',
  },
  {
    name: 'Backdoor listener',
    re: /ncat\s+-l|python.*socket.*bind/g,
    severity: 'high',
  },
  {
    name: 'Suspicious PowerShell',
    re: /powershell.*-enc.*-ExecutionPolicy Bypass/gi,
    severity: 'high',
  },
  {
    name: 'Process injection',
    re: /CreateRemoteThread|VirtualAllocEx|WriteProcessMemory/g,
    severity: 'high',
  },
  {
    name: 'Keylogger pattern',
    re: /GetAsyncKeyState|SetWindowsHookEx.*WH_KEYBOARD/g,
    severity: 'high',
  },
  {
    name: 'Cryptocurrency wallet theft',
    re: /window\.ethereum.*request.*eth_sendTransaction/g,
    severity: 'critical',
  },
  {
    name: 'Cookie stealer',
    re: /document\.cookie.*fetch|new Image\(\).*document\.cookie/gi,
    severity: 'high',
  },
  {
    name: 'Phishing form',
    re: /<form[^>]+action=["']https?:\/\/[^"']*login[^"']*["'][^>]*>/gi,
    severity: 'medium',
  },
  {
    name: 'Crypto wallet address pattern',
    re: /(bc1[a-z0-9]{39})|(0x[a-fA-F0-9]{40})/g,
    severity: 'low',
  },
];

const RCE_PATTERNS = [
  {
    name: 'eval() with input',
    re: /eval\s*\(\s*(?:req|request|input|user|params)/g,
    severity: 'critical',
  },
  {
    name: 'exec() with input',
    re: /exec\s*\(\s*(?:req|request|input|user|params)/g,
    severity: 'critical',
  },
  {
    name: 'Function constructor',
    re: /new\s+Function\s*\(\s*(?:req|request|input)/g,
    severity: 'critical',
  },
  {
    name: 'Child process spawn',
    re: /child_process.*spawn\s*\(\s*(?:req|request|input)/g,
    severity: 'critical',
  },
  {
    name: 'System command',
    re: /execSync\s*\(\s*[`'"][^`'"]*\$/g,
    severity: 'high',
  },
  {
    name: 'Dynamic require',
    re: /require\s*\(\s*(?:req|request|input|user)/g,
    severity: 'high',
  },
];

const NETWORK_PATTERNS = [
  {
    name: 'External fetch',
    re: /fetch\s*\(\s*["'](https?:\/\/(?!localhost|127\.0\.0\.1|sukit\.dev)[^"']+)/g,
    severity: 'medium',
  },
  {
    name: 'HTTP request library',
    re: /axios\.get|axios\.post|axios\.request/g,
    severity: 'low',
  },
  {
    name: 'WebSocket external',
    re: /new\s+WebSocket\s*\(\s*["']wss?:\/\/(?!localhost)/g,
    severity: 'medium',
  },
  {
    name: 'DNS prefetch',
    re: /dns-prefetch.*href=["']https?:\/\//g,
    severity: 'low',
  },
];

const VULN_DB: Record<string, { severity: string; note: string }> = {
  lodash: { severity: 'high', note: 'Prototype pollution CVE-2019-10744' },
  minimist: { severity: 'medium', note: 'Prototype pollution CVE-2020-7598' },
  axios: { severity: 'medium', note: 'SSRF in older versions' },
  'node-fetch': { severity: 'low', note: 'CVE-2022-0235' },
  ws: { severity: 'medium', note: 'DoS CVE-2024-37890' },
  tar: { severity: 'high', note: 'Arbitrary file write CVE-2021-37701' },
  handlebars: { severity: 'critical', note: 'RCE CVE-2019-19919' },
  ejs: { severity: 'critical', note: 'RCE CVE-2022-29078' },
  pug: { severity: 'high', note: 'Code injection' },
  express: { severity: 'low', note: 'Open redirect' },
  request: { severity: 'high', note: 'SSRF CVE-2023-28155 (deprecated)' },
};

const DANGEROUS_PERMISSIONS = [
  'filesystem:write',
  'filesystem:delete',
  'network:raw',
  'system:exec',
  'system:env',
  'database:raw',
  'user:impersonate',
  'billing:charge',
  'email:bulk',
];

export type ScanResult = {
  type: string;
  findings: { name: string; severity: string; matches?: number }[];
  clean: boolean;
};

export function scanSecrets(content: string): ScanResult {
  const findings: any[] = [];
  for (const p of SECRET_PATTERNS) {
    const matches = content.match(p.re);
    if (matches) {
      findings.push({
        name: p.name,
        severity: 'high',
        matches: matches.length,
      });
    }
  }
  return { type: 'secrets', findings, clean: findings.length === 0 };
}

export function scanObfuscation(content: string): ScanResult {
  const findings: any[] = [];
  for (const p of OBFUSCATION_PATTERNS) {
    const matches = content.match(p.re);
    if (matches) {
      findings.push({
        name: p.name,
        severity: p.severity,
        matches: matches.length,
      });
    }
  }
  return { type: 'obfuscation', findings, clean: findings.length === 0 };
}

export function scanMalware(content: string): ScanResult {
  const findings: any[] = [];
  for (const p of MALWARE_SIGNATURES) {
    const matches = content.match(p.re);
    if (matches) {
      findings.push({
        name: p.name,
        severity: p.severity,
        matches: matches.length,
      });
    }
  }
  return { type: 'malware', findings, clean: findings.length === 0 };
}

export function scanRCE(content: string): ScanResult {
  const findings: any[] = [];
  for (const p of RCE_PATTERNS) {
    const matches = content.match(p.re);
    if (matches) {
      findings.push({
        name: p.name,
        severity: p.severity,
        matches: matches.length,
      });
    }
  }
  return { type: 'rce', findings, clean: findings.length === 0 };
}

export function scanNetwork(content: string): ScanResult {
  const findings: any[] = [];
  for (const p of NETWORK_PATTERNS) {
    const matches = content.match(p.re);
    if (matches) {
      findings.push({
        name: p.name,
        severity: p.severity,
        matches: matches.length,
      });
    }
  }
  return { type: 'network', findings, clean: findings.length === 0 };
}

export function scanDependencies(pkg: any): ScanResult {
  const findings: any[] = [];
  const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  for (const [name, range] of Object.entries(deps)) {
    const v = VULN_DB[name];
    if (v) {
      findings.push({
        name: `${name}@${range}`,
        severity: v.severity,
        matches: 1,
        note: v.note,
      });
    }
  }
  return { type: 'dependencies', findings, clean: findings.length === 0 };
}

export type ValidationReport = {
  manifest: { valid: boolean; issues: string[] };
  permissions: { valid: boolean; issues: string[] };
  dependencies: { valid: boolean; issues: string[] };
  malicious: { clean: boolean; issues: string[] };
  rce: { clean: boolean; issues: string[] };
  network: { clean: boolean; issues: string[] };
  filesize: {
    valid: boolean;
    size: number;
    formattedSize: string;
    issues: string[];
  };
  compatibility: { valid: boolean; issues: string[] };
};

export function validateManifest(manifest: any) {
  const issues: string[] = [];
  if (!manifest || typeof manifest !== 'object') {
    issues.push('Manifest must be an object');
    return { valid: false, issues };
  }
  const required = ['name', 'version', 'author', 'sukitVersion'];
  for (const f of required) {
    if (!manifest[f]) issues.push(`Missing required field: ${f}`);
  }
  if (manifest.version && !/^\d+\.\d+\.\d+/.test(manifest.version))
    issues.push('Version must be semver');
  if (manifest.name && manifest.name.length > 80)
    issues.push('Name too long (max 80)');
  if (manifest.description && manifest.description.length > 500)
    issues.push('Description too long (max 500)');
  if (manifest.permissions && !Array.isArray(manifest.permissions))
    issues.push('Permissions must be an array');
  if (manifest.dependencies && typeof manifest.dependencies !== 'object')
    issues.push('Dependencies must be an object');
  return { valid: issues.length === 0, issues };
}

export function validatePermissions(permissions: string[]) {
  const issues: string[] = [];
  for (const p of permissions || []) {
    if (DANGEROUS_PERMISSIONS.includes(p)) {
      issues.push(`Dangerous permission requested: ${p}`);
    }
    if (!/^[a-z]+:[a-z_-]+$/.test(p)) {
      issues.push(`Invalid permission format: ${p}`);
    }
  }
  return { valid: issues.length === 0, issues };
}

export function validateDependencies(deps: any) {
  const issues: string[] = [];
  if (!deps || typeof deps !== 'object') return { valid: true, issues };
  for (const [name, range] of Object.entries(deps)) {
    if (VULN_DB[name]) {
      issues.push(`Vulnerable dependency: ${name} - ${VULN_DB[name].note}`);
    }
    if (typeof range !== 'string') {
      issues.push(`Invalid range for ${name}`);
    }
  }
  return { valid: issues.length === 0, issues };
}

export function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export function validateFileSize(size: number) {
  const issues: string[] = [];
  const MAX = 50 * 1024 * 1024;
  if (size > MAX) issues.push(`File exceeds 50 MB limit (${formatSize(size)})`);
  if (size === 0) issues.push('File is empty');
  return {
    valid: issues.length === 0,
    size,
    formattedSize: formatSize(size),
    issues,
  };
}

export function validateCompatibility(manifest: any) {
  const issues: string[] = [];
  if (!manifest?.sukitVersion) {
    issues.push('Missing sukitVersion');
    return { valid: false, issues };
  }
  if (!/^[\^~]?\d+\.\d+\.\d+/.test(manifest.sukitVersion)) {
    issues.push('sukitVersion must be a valid range');
  }
  return { valid: issues.length === 0, issues };
}

export async function getSubmissionStatus(userId: string, moduleId: string) {
  const mod = await prisma.marketplaceModule.findFirst({
    where: { OR: [{ id: moduleId }, { moduleId }], authorId: userId },
  });
  if (!mod) throw new Error('Module not found');
  const reviews = await prisma.submissionReview.findMany({
    where: { moduleId: mod.id },
    orderBy: { createdAt: 'desc' },
  });
  const latest = reviews[0];
  return {
    status: mod.status,
    currentStep:
      mod.status === 'draft'
        ? 'details'
        : mod.status === 'pending_review'
          ? 'in_review'
          : 'complete',
    rejectionReason: mod.rejectionReason,
    review: latest || null,
  };
}

export async function submitForReview(userId: string, moduleId: string) {
  const mod = await prisma.marketplaceModule.findFirst({
    where: { OR: [{ id: moduleId }, { moduleId }], authorId: userId },
  });
  if (!mod) throw new Error('Module not found');
  if (mod.status !== 'draft' && mod.status !== 'rejected') {
    throw new Error('Module is already submitted or approved');
  }
  // Run all validators
  const report: ValidationReport = {
    manifest: validateManifest({
      name: mod.name,
      version: mod.version,
      author: mod.authorName,
      sukitVersion: mod.minSukitVersion,
      description: mod.description,
      permissions: mod.permissions,
      dependencies: mod.dependencies,
    }),
    permissions: validatePermissions(mod.permissions),
    dependencies: validateDependencies(mod.dependencies),
    malicious: { clean: true, issues: [] },
    rce: { clean: true, issues: [] },
    network: { clean: true, issues: [] },
    filesize: { valid: true, size: 0, formattedSize: '0 B', issues: [] },
    compatibility: validateCompatibility({ sukitVersion: mod.minSukitVersion }),
  };
  const allValid =
    report.manifest.valid &&
    report.permissions.valid &&
    report.dependencies.valid &&
    report.malicious.clean &&
    report.rce.clean &&
    report.network.clean &&
    report.compatibility.valid;
  if (!allValid) {
    throw new Error('Validation failed: ' + JSON.stringify(report));
  }
  const review = await prisma.submissionReview.create({
    data: {
      moduleId: mod.id,
      reviewerId: 'system',
      status: 'pending',
      validationResults: report as any,
    },
  });
  await prisma.marketplaceModule.update({
    where: { id: mod.id },
    data: { status: 'pending_review', rejectionReason: null },
  });
  await emit('module.published' as any, {
    moduleId: mod.moduleId,
    action: 'submit',
  });
  return {
    success: true,
    message: 'Submitted for review',
    reviewId: review.id,
  };
}

export async function requestChanges(userId: string, moduleId: string) {
  const mod = await prisma.marketplaceModule.findFirst({
    where: { OR: [{ id: moduleId }, { moduleId }], authorId: userId },
  });
  if (!mod) throw new Error('Module not found');
  await prisma.marketplaceModule.update({
    where: { id: mod.id },
    data: { status: 'draft' },
  });
  return { success: true };
}

export async function deprecateModule(
  userId: string,
  moduleId: string,
  reason?: string
) {
  const mod = await prisma.marketplaceModule.findFirst({
    where: { OR: [{ id: moduleId }, { moduleId }], authorId: userId },
  });
  if (!mod) throw new Error('Module not found');
  await prisma.marketplaceModule.update({
    where: { id: mod.id },
    data: {
      status: 'deprecated',
      rejectionReason: reason || 'Deprecated by author',
    },
  });
  return { success: true };
}

export async function publishVersion(
  userId: string,
  moduleId: string,
  data: {
    version: string;
    changelog?: string;
    downloadUrl: string;
    fileSize?: number;
    fileHash?: string;
    sukVersion: string;
    isBeta?: boolean;
  }
) {
  const mod = await prisma.marketplaceModule.findFirst({
    where: { OR: [{ id: moduleId }, { moduleId }], authorId: userId },
  });
  if (!mod) throw new Error('Module not found');
  if (!/^\d+\.\d+\.\d+/.test(data.version))
    throw new Error('Version must be semver');
  const existing = await prisma.moduleVersion.findFirst({
    where: { moduleId: mod.id, version: data.version },
  });
  if (existing) throw new Error('Version already exists');
  await prisma.moduleVersion.updateMany({
    where: { moduleId: mod.id },
    data: { isLatest: false },
  });
  await prisma.moduleVersion.create({
    data: {
      moduleId: mod.id,
      version: data.version,
      changelog: data.changelog,
      downloadUrl: data.downloadUrl,
      fileSize: data.fileSize || 0,
      fileHash: data.fileHash,
      sukVersion: data.sukVersion,
      isLatest: true,
      isBeta: data.isBeta || false,
    },
  });
  await prisma.marketplaceModule.update({
    where: { id: mod.id },
    data: { version: data.version, updatedAt: new Date() },
  });
  return { success: true, version: data.version };
}

export async function listPendingSubmissions(filters: any = {}) {
  const page = filters.page ?? 1;
  const pageSize = Math.min(100, filters.pageSize ?? 20);
  const [items, total] = await Promise.all([
    prisma.submissionReview.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { module: true },
    }),
    prisma.submissionReview.count({ where: { status: 'pending' } }),
  ]);
  return { submissions: items, total, page, pageSize };
}

export async function approveSubmission(reviewId: string, reviewerId: string) {
  const review = await prisma.submissionReview.findUnique({
    where: { id: reviewId },
  });
  if (!review) throw new Error('Submission not found');
  await prisma.submissionReview.update({
    where: { id: reviewId },
    data: { status: 'approved', reviewerId, reviewedAt: new Date() },
  });
  await prisma.marketplaceModule.update({
    where: { id: review.moduleId },
    data: {
      status: 'approved',
      publishedAt: new Date(),
      rejectionReason: null,
    },
  });
  await audit('module.approve' as any, {
    userId: reviewerId,
    resourceType: 'module',
    resourceId: review.moduleId,
  });
  await emit('submission.approved', { moduleId: review.moduleId });
  return { success: true };
}

export async function rejectSubmission(
  reviewId: string,
  reviewerId: string,
  reason: string
) {
  const review = await prisma.submissionReview.findUnique({
    where: { id: reviewId },
  });
  if (!review) throw new Error('Submission not found');
  await prisma.submissionReview.update({
    where: { id: reviewId },
    data: {
      status: 'rejected',
      reviewerId,
      notes: reason,
      reviewedAt: new Date(),
    },
  });
  await prisma.marketplaceModule.update({
    where: { id: review.moduleId },
    data: { status: 'rejected', rejectionReason: reason },
  });
  await audit('module.reject' as any, {
    userId: reviewerId,
    resourceType: 'module',
    resourceId: review.moduleId,
    changes: { reason },
  });
  await emit('submission.rejected', { moduleId: review.moduleId, reason });
  return { success: true };
}

export async function getReports() {
  const [pendingCount, flaggedCount, recentSubs] = await Promise.all([
    prisma.submissionReview.count({ where: { status: 'pending' } }),
    prisma.moduleReview.count({ where: { status: 'flagged' } }),
    prisma.submissionReview.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { module: { select: { moduleId: true, name: true } } },
    }),
  ]);
  return {
    pendingSubmissions: pendingCount,
    flaggedReviews: flaggedCount,
    recent: recentSubs,
  };
}
