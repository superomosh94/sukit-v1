import {
  createHash,
  randomBytes,
  createCipheriv,
  createDecipheriv,
  timingSafeEqual,
  createPublicKey,
  createPrivateKey,
  sign,
  verify,
} from 'crypto';
import type { SukitKernel } from '@sukit/core';

export interface SecurityConfig {
  bcryptRounds: number;
  sessionTimeout: number;
  sessionRotationInterval: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
  passwordMinLength: number;
  passwordHistoryCount: number;
  passwordMaxAge: number;
  apiKeyExpiryDays: number;
  rateLimitGlobal: number;
  rateLimitAuth: number;
  rateLimitUser: number;
  maxFileSize: number;
  allowedOrigins: string[];
  cspDirectives: Record<string, string[]>;
  cspReportUri: string;
  totpEnabled: boolean;
  webauthnEnabled: boolean;
  captchaEnabled: boolean;
  captchaProvider: 'hcaptcha' | 'turnstile';
  captchaSecret: string;
  kmsEnabled: boolean;
  kmsProvider: 'aws' | 'azure' | 'gcp' | 'vault';
  kmsKeyId: string;
  rlsEnabled: boolean;
  apiScopesEnabled: boolean;
  adminEscalationPrevention: boolean;
  allowedMimeCategories: string[];
  blockedExtensions: string[];
}

const DEFAULT_CONFIG: SecurityConfig = {
  bcryptRounds: 12,
  sessionTimeout: 28800,
  sessionRotationInterval: 3600,
  maxLoginAttempts: 10,
  lockoutDuration: 1800,
  passwordMinLength: 8,
  passwordHistoryCount: 5,
  passwordMaxAge: 7776000,
  apiKeyExpiryDays: 90,
  rateLimitGlobal: 1000,
  rateLimitAuth: 20,
  rateLimitUser: 5000,
  maxFileSize: 10485760,
  allowedOrigins: [process.env.APP_URL || 'http://localhost:3042'],
  cspDirectives: {
    'default-src': ["'self'"],
    'script-src': ["'self'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'https:'],
    'font-src': ["'self'", 'https:'],
    'connect-src': ["'self'", 'https:'],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
  },
  cspReportUri: '/api/security/csp-report',
  totpEnabled: true,
  webauthnEnabled: false,
  captchaEnabled: false,
  captchaProvider: 'hcaptcha',
  captchaSecret: process.env.CAPTCHA_SECRET || '',
  kmsEnabled: false,
  kmsProvider: 'aws',
  kmsKeyId: process.env.KMS_KEY_ID || '',
  rlsEnabled: false,
  apiScopesEnabled: false,
  adminEscalationPrevention: true,
  allowedMimeCategories: ['image', 'video', 'document', 'archive'],
  blockedExtensions: ['exe', 'sh', 'bat', 'ps1', 'dll', 'msi', 'jar', 'vbs', 'cmd', 'com', 'scr', 'pif', 'reg'],
};

export class SecuritySystem {
  private kernel: SukitKernel;
  private config: SecurityConfig;
  private loginAttempts: Map<string, { count: number; lockedUntil: number }> =
    new Map();
  private rateLimits: Map<string, { count: number; resetAt: number }> =
    new Map();
  private passwordHistories: Map<string, string[]> = new Map();
  private passwordChangedAt: Map<string, number> = new Map();
  private sessions: Map<string, { userId: string; token: string; createdAt: number; rotatedAt: number }> = new Map();
  private userRoles: Map<string, string[]> = new Map();
  private userScopes: Map<string, Set<string>> = new Map();
  private webauthnCredentials: Map<string, { credentialId: string; publicKey: string; counter: number }[]> = new Map();
  private rlsPolicies: Map<string, { table: string; policy: string; roles: string[] }[]> = new Map();
  private kmsKeys: Map<string, { id: string; material: Buffer; algorithm: string; createdAt: number }> = new Map();

  constructor(kernel: SukitKernel, config?: Partial<SecurityConfig>) {
    this.kernel = kernel;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ─── Password Security ─────────────────────────────────────────

  async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const hash = createHash('sha256')
      .update(password + salt)
      .digest('hex');
    for (let i = 1; i < this.config.bcryptRounds; i++) {
      createHash('sha256')
        .update(hash + salt)
        .digest('hex');
    }
    return `${salt}:${hash}`;
  }

  async verifyPassword(password: string, stored: string): Promise<boolean> {
    const [salt, hash] = stored.split(':');
    const inputHash = createHash('sha256')
      .update(password + salt)
      .digest('hex');
    try {
      return timingSafeEqual(Buffer.from(hash), Buffer.from(inputHash));
    } catch {
      return false;
    }
  }

  validatePasswordStrength(password: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    if (password.length < this.config.passwordMinLength)
      errors.push(`Minimum ${this.config.passwordMinLength} characters`);
    if (!/[a-z]/.test(password)) errors.push('Include a lowercase letter');
    if (!/[A-Z]/.test(password)) errors.push('Include an uppercase letter');
    if (!/[0-9]/.test(password)) errors.push('Include a number');
    if (!/[^a-zA-Z0-9]/.test(password))
      errors.push('Include a special character');
    return { valid: errors.length === 0, errors };
  }

  // ─── Session Security ──────────────────────────────────────────

  generateSession(): { token: string; expiresAt: Date } {
    return {
      token: randomBytes(48).toString('hex'),
      expiresAt: new Date(Date.now() + this.config.sessionTimeout * 1000),
    };
  }

  validateSession(session: {
    token: string;
    expiresAt: string | Date;
  }): boolean {
    return new Date(session.expiresAt) > new Date();
  }

  // ─── Login Rate Limiting ───────────────────────────────────────

  checkLoginAttempt(identifier: string): {
    allowed: boolean;
    retryAfter?: number;
  } {
    const entry = this.loginAttempts.get(identifier);
    const now = Date.now();

    if (entry && entry.lockedUntil > now) {
      return {
        allowed: false,
        retryAfter: Math.ceil((entry.lockedUntil - now) / 1000),
      };
    }
    if (entry && entry.count >= this.config.maxLoginAttempts) {
      entry.lockedUntil = now + this.config.lockoutDuration * 1000;
      entry.count = 0;
      return { allowed: false, retryAfter: this.config.lockoutDuration };
    }

    if (!entry || entry.lockedUntil < now) {
      this.loginAttempts.set(identifier, { count: 1, lockedUntil: 0 });
    } else {
      entry.count++;
    }
    return { allowed: true };
  }

  resetLoginAttempts(identifier: string): void {
    this.loginAttempts.delete(identifier);
  }

  // ─── API Rate Limiting ─────────────────────────────────────────

  checkRateLimit(
    key: string,
    limit?: number
  ): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const maxLimit = limit || this.config.rateLimitGlobal;
    let entry = this.rateLimits.get(key);
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + 3600000 };
      this.rateLimits.set(key, entry);
    }
    entry.count++;
    return {
      allowed: entry.count <= maxLimit,
      remaining: Math.max(0, maxLimit - entry.count),
      resetAt: entry.resetAt,
    };
  }

  getRateLimitHeaders(key: string, limit?: number): Record<string, string> {
    const { remaining, resetAt } = this.checkRateLimit(key, limit);
    return {
      'X-RateLimit-Limit': String(limit || this.config.rateLimitGlobal),
      'X-RateLimit-Remaining': String(remaining),
      'X-RateLimit-Reset': String(Math.ceil(resetAt / 1000)),
    };
  }

  // ─── Security Headers ──────────────────────────────────────────

  getSecurityHeaders(origin?: string): Record<string, string> {
    const validOrigin =
      origin && this.config.allowedOrigins.some((o) => origin.startsWith(o))
        ? origin
        : this.config.allowedOrigins[0];
    return {
      'Content-Security-Policy': this.buildCSP(),
      'Strict-Transport-Security':
        'max-age=63072000; includeSubDomains; preload',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy':
        'camera=(), microphone=(), geolocation=(), interest-cohort=()',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-origin',
      'Access-Control-Allow-Origin': validOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    };
  }

  private buildCSP(): string {
    return Object.entries(this.config.cspDirectives)
      .map(([key, values]) => `${key} ${values.join(' ')}`)
      .join('; ');
  }

  // ─── Input Sanitization ────────────────────────────────────────

  sanitizeHtml(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  sanitizeUrl(url: string): string {
    try {
      const u = new URL(url);
      return ['http:', 'https:', 'mailto:'].includes(u.protocol) ? url : '';
    } catch {
      return '';
    }
  }

  sanitizeSlug(slug: string): string {
    return slug
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 200);
  }

  sanitizeFilename(filename: string): string {
    const name = filename.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 255);
    const ext = name.split('.').pop();
    const blocked = ['exe', 'sh', 'bat', 'ps1', 'dll', 'msi', 'jar', 'vbs'];
    return blocked.includes(ext || '') ? `${name}.blocked` : name;
  }

  sanitizeEmail(email: string): string {
    const clean = email.trim().toLowerCase();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean) ? clean : '';
  }

  // ─── File Security ─────────────────────────────────────────────

  validateFileType(
    mime: string,
    extension: string
  ): { valid: boolean; reason?: string } {
    const allowed: Record<string, string[]> = {
      image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg'],
      video: ['mp4', 'webm', 'ogv'],
      document: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv'],
      archive: ['zip', 'tar', 'gz'],
    };
    const type = mime.split('/')[0];
    const exts = allowed[type] || [];
    if (!exts.includes(extension.toLowerCase()))
      return {
        valid: false,
        reason: `Extension .${extension} not allowed for ${type}`,
      };
    return { valid: true };
  }

  checkMagicNumber(buffer: Buffer, expectedType: string): boolean {
    const signatures: Record<string, number[]> = {
      jpeg: [0xff, 0xd8, 0xff],
      png: [0x89, 0x50, 0x4e, 0x47],
      gif: [0x47, 0x49, 0x46],
      webp: [0x52, 0x49, 0x46, 0x46],
      pdf: [0x25, 0x50, 0x44, 0x46],
      zip: [0x50, 0x4b, 0x03, 0x04],
    };
    const sig = signatures[expectedType];
    if (!sig) return true;
    return sig.every((byte, i) => buffer[i] === byte);
  }

  // ─── Encryption ────────────────────────────────────────────────

  encrypt(text: string, key: string): string {
    const iv = randomBytes(16);
    const cipher = createCipheriv(
      'aes-256-gcm',
      createHash('sha256').update(key).digest(),
      iv
    );
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  decrypt(encrypted: string, key: string): string {
    const [ivHex, authTagHex, data] = encrypted.split(':');
    const decipher = createDecipheriv(
      'aes-256-gcm',
      createHash('sha256').update(key).digest(),
      Buffer.from(ivHex, 'hex')
    );
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    let decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  generateApiKey(): { key: string; hash: string; preview: string } {
    const key = `suk_${randomBytes(32).toString('hex')}`;
    const hash = createHash('sha256').update(key).digest('hex');
    return { key, hash, preview: key.substring(0, 12) + '...' };
  }

  generateCsrfToken(): string {
    return randomBytes(32).toString('hex');
  }

  validateOrigin(origin: string | undefined): boolean {
    if (!origin) return false;
    return this.config.allowedOrigins.some((allowed) =>
      origin.startsWith(allowed)
    );
  }

  // ─── DOMPurify HTML Sanitizer ─────────────────────────────────

  sanitizeDom(html: string): string {
    const allowedTags = new Set([
      'a', 'abbr', 'article', 'b', 'blockquote', 'br', 'caption', 'cite',
      'code', 'col', 'colgroup', 'dd', 'del', 'details', 'dfn', 'div',
      'dl', 'dt', 'em', 'figcaption', 'figure', 'h1', 'h2', 'h3', 'h4',
      'h5', 'h6', 'hr', 'i', 'img', 'ins', 'kbd', 'li', 'mark', 'ol',
      'p', 'pre', 'q', 's', 'samp', 'section', 'small', 'span', 'strong',
      'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'tfoot', 'th',
      'thead', 'time', 'tr', 'u', 'ul', 'var',
    ]);
    const allowedAttrs = new Set([
      'href', 'target', 'rel', 'title', 'alt', 'src', 'width', 'height',
      'class', 'id', 'style', 'data-', 'aria-', 'role', 'loading', 'decoding',
      'sizes', 'srcset', 'cite', 'datetime', 'colspan', 'rowspan',
    ]);
    const uriAttrs = new Set(['href', 'src', 'cite', 'action', 'formaction']);
    const uriSchemes = ['http:', 'https:', 'mailto:', 'tel:', '#'];

    let result = html;
    result = result.replace(/<script[\s\S]*?<\/script>/gi, '');
    result = result.replace(/<style[\s\S]*?<\/style>/gi, '');
    result = result.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    result = result.replace(/on\w+\s*=\s*\S+/gi, '');
    result = result.replace(/javascript\s*:/gi, '');
    result = result.replace(/vbscript\s*:/gi, '');
    result = result.replace(/data\s*:/gi, '');

    result = result.replace(/<(\/?)(\w+)[^>]*>/g, (_match, slash, tagName) => {
      const tag = tagName.toLowerCase();
      if (slash && !allowedTags.has(tag)) return '';
      if (!slash && !allowedTags.has(tag)) {
        return htmlEncodeEntities(_match);
      }
      return _match;
    });

    result = result.replace(/(\w+)\s*=\s*["']([^"']*)["']/g, (match, attr, value) => {
      const a = attr.toLowerCase();
      if (!allowedAttrs.has(a) && !Array.from(allowedAttrs).some(p => a.startsWith(p) && p.endsWith('-'))) {
        return '';
      }
      if (uriAttrs.has(a) && !uriSchemes.some(s => value.toLowerCase().startsWith(s))) {
        return '';
      }
      return match;
    });

    function htmlEncodeEntities(text: string): string {
      return text.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
    }

    return result;
  }

  // ─── Password History & Expiry ────────────────────────────────

  checkPasswordHistory(userId: string, newPassword: string): boolean {
    const history = this.passwordHistories.get(userId) || [];
    for (const oldHash of history) {
      if (this.verifyPassword(newPassword, oldHash)) return false;
    }
    return true;
  }

  recordPasswordChange(userId: string, passwordHash: string): void {
    const history = this.passwordHistories.get(userId) || [];
    history.unshift(passwordHash);
    if (history.length > this.config.passwordHistoryCount) {
      history.pop();
    }
    this.passwordHistories.set(userId, history);
    this.passwordChangedAt.set(userId, Date.now());
  }

  isPasswordExpired(userId: string): boolean {
    const changedAt = this.passwordChangedAt.get(userId);
    if (!changedAt) return true;
    return Date.now() - changedAt > this.config.passwordMaxAge * 1000;
  }

  getPasswordAge(userId: string): number {
    const changedAt = this.passwordChangedAt.get(userId);
    if (!changedAt) return Infinity;
    return Math.floor((Date.now() - changedAt) / 86400000);
  }

  // ─── Session Rotation ─────────────────────────────────────────

  rotateSession(userId: string, currentToken: string): { token: string; expiresAt: Date } | null {
    const session = this.sessions.get(currentToken);
    if (!session || session.userId !== userId) return null;
    const newSession = this.generateSession();
    this.sessions.delete(currentToken);
    this.sessions.set(newSession.token, {
      userId,
      token: newSession.token,
      createdAt: Date.now(),
      rotatedAt: Date.now(),
    });
    return newSession;
  }

  shouldRotateSession(token: string): boolean {
    const session = this.sessions.get(token);
    if (!session) return false;
    return Date.now() - session.rotatedAt > this.config.sessionRotationInterval * 1000;
  }

  trackSession(userId: string, token: string): void {
    this.sessions.set(token, { userId, token, createdAt: Date.now(), rotatedAt: Date.now() });
  }

  invalidateSession(token: string): void {
    this.sessions.delete(token);
  }

  getActiveSessions(userId: string): number {
    let count = 0;
    for (const session of this.sessions.values()) {
      if (session.userId === userId) count++;
    }
    return count;
  }

  // ─── WebAuthn / Passkeys ──────────────────────────────────────

  generateWebAuthnRegistrationOptions(userId: string, username: string): {
    challenge: string;
    rp: { name: string; id: string };
    user: { id: string; name: string; displayName: string };
    pubKeyCredParams: { type: string; alg: number }[];
    authenticatorSelection: { authenticatorAttachment: string; residentKey: string; requireResidentKey: boolean };
    attestation: string;
    timeout: number;
  } {
    const challenge = randomBytes(32).toString('base64url');
    return {
      challenge,
      rp: { name: 'SUKIT', id: new URL(this.config.allowedOrigins[0]).hostname },
      user: { id: Buffer.from(userId).toString('base64url'), name: username, displayName: username },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },
        { type: 'public-key', alg: -257 },
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        residentKey: 'preferred',
        requireResidentKey: false,
      },
      attestation: 'none',
      timeout: 60000,
    };
  }

  verifyWebAuthnRegistration(
    userId: string,
    credential: { id: string; rawId: string; response: { clientDataJSON: string; attestationObject: string }; type: string },
    challenge: string
  ): boolean {
    try {
      const clientData = JSON.parse(
        Buffer.from(credential.response.clientDataJSON, 'base64url').toString()
      );
      if (clientData.challenge !== challenge) return false;
      if (clientData.type !== 'webauthn.create') return false;
      const existing = this.webauthnCredentials.get(userId) || [];
      existing.push({
        credentialId: credential.id,
        publicKey: credential.response.attestationObject,
        counter: 0,
      });
      this.webauthnCredentials.set(userId, existing);
      return true;
    } catch {
      return false;
    }
  }

  generateWebAuthnAssertionOptions(userId: string): {
    challenge: string;
    rpId: string;
    allowCredentials: { type: string; id: string }[];
    timeout: number;
    userVerification: string;
  } | null {
    const creds = this.webauthnCredentials.get(userId);
    if (!creds || creds.length === 0) return null;
    return {
      challenge: randomBytes(32).toString('base64url'),
      rpId: new URL(this.config.allowedOrigins[0]).hostname,
      allowCredentials: creds.map(c => ({ type: 'public-key', id: c.credentialId })),
      timeout: 60000,
      userVerification: 'preferred',
    };
  }

  // ─── CAPTCHA Verification ─────────────────────────────────────

  async verifyCaptcha(token: string): Promise<{ success: boolean; score?: number }> {
    if (!this.config.captchaEnabled) return { success: true };
    const secret = this.config.captchaSecret;
    if (!secret) return { success: false };
    const url = this.config.captchaProvider === 'hcaptcha'
      ? 'https://hcaptcha.com/siteverify'
      : 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ secret, response: token }),
      });
      const data = await res.json() as any;
      return { success: data.success, score: data.score };
    } catch {
      return { success: false };
    }
  }

  // ─── KMS / Vault Integration ──────────────────────────────────

  async kmsEncrypt(plaintext: string, keyId?: string): Promise<{ ciphertext: string; keyId: string; algorithm: string } | null> {
    if (!this.config.kmsEnabled) {
      return { ciphertext: this.encrypt(plaintext, process.env.APP_SECRET || 'default-key'), keyId: 'local', algorithm: 'aes-256-gcm' };
    }
    const kid = keyId || this.config.kmsKeyId;
    try {
      const res = await fetch(`${this.getKmsEndpoint()}/encrypt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.KMS_TOKEN || ''}` },
        body: JSON.stringify({ keyId: kid, plaintext: Buffer.from(plaintext).toString('base64') }),
      });
      const data = await res.json() as any;
      return { ciphertext: data.ciphertext, keyId: kid, algorithm: 'aes-256-gcm' };
    } catch {
      return { ciphertext: this.encrypt(plaintext, this.config.kmsKeyId), keyId: kid || 'fallback', algorithm: 'aes-256-gcm' };
    }
  }

  async kmsDecrypt(ciphertext: string, keyId?: string): Promise<string | null> {
    if (!this.config.kmsEnabled) {
      return this.decrypt(ciphertext, process.env.APP_SECRET || 'default-key');
    }
    const kid = keyId || this.config.kmsKeyId;
    try {
      const res = await fetch(`${this.getKmsEndpoint()}/decrypt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.KMS_TOKEN || ''}` },
        body: JSON.stringify({ keyId: kid, ciphertext }),
      });
      const data = await res.json() as any;
      return Buffer.from(data.plaintext, 'base64').toString();
    } catch {
      return this.decrypt(ciphertext, this.config.kmsKeyId);
    }
  }

  async rotateKmsKey(keyId: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.getKmsEndpoint()}/rotate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.KMS_TOKEN || ''}` },
        body: JSON.stringify({ keyId }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  private getKmsEndpoint(): string {
    const endpoints: Record<string, string> = {
      aws: `https://kms.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com`,
      azure: `https://${process.env.AZURE_VAULT || 'sukit'}.vault.azure.net`,
      gcp: `https://cloudkms.googleapis.com/v1/projects/${process.env.GCP_PROJECT || 'sukit'}/locations/global/keyRings/sukit`,
      vault: process.env.VAULT_ADDR || 'http://vault:8200/v1/transit',
    };
    return endpoints[this.config.kmsProvider] || endpoints.aws;
  }

  // ─── Row-Level Security ───────────────────────────────────────

  addRlsPolicy(table: string, policy: string, roles: string[]): void {
    const existing = this.rlsPolicies.get(table) || [];
    existing.push({ table, policy, roles });
    this.rlsPolicies.set(table, existing);
  }

  getRlsPolicy(table: string, role: string): string | null {
    const policies = this.rlsPolicies.get(table);
    if (!policies) return null;
    const applicable = policies.filter(p => p.roles.includes(role) || p.roles.includes('*'));
    if (applicable.length === 0) return null;
    return applicable.map(p => p.policy).join(' AND ');
  }

  generateRlsSql(table: string, role: string, userId: string): string {
    const policy = this.getRlsPolicy(table, role);
    if (!policy) return '';
    return policy.replace(/:userId/g, `'${userId}'`);
  }

  enableRlsForTable(table: string): string {
    return `ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`;
  }

  // ─── API Scope Validation ─────────────────────────────────────

  setUserScopes(userId: string, scopes: string[]): void {
    this.userScopes.set(userId, new Set(scopes));
  }

  hasScope(userId: string, requiredScope: string): boolean {
    const scopes = this.userScopes.get(userId);
    if (!scopes) return false;
    if (scopes.has('*')) return true;
    const parts = requiredScope.split(':');
    for (const scope of scopes) {
      if (scope === requiredScope) return true;
      const sp = scope.split(':');
      if (sp[0] === parts[0] && sp[1] === '*') return true;
      if (scope.endsWith(':*') && scope.startsWith(parts[0])) return true;
    }
    return false;
  }

  validateApiScope(userId: string, method: string, path: string): boolean {
    const scopeMap: Record<string, string> = {
      'GET:/api/sites': 'sites:read',
      'POST:/api/sites': 'sites:write',
      'PUT:/api/sites': 'sites:write',
      'DELETE:/api/sites': 'sites:delete',
      'GET:/api/pages': 'pages:read',
      'POST:/api/pages': 'pages:write',
      'PUT:/api/pages': 'pages:write',
      'DELETE:/api/pages': 'pages:delete',
      'GET:/api/media': 'media:read',
      'POST:/api/media': 'media:write',
      'GET:/api/users': 'users:read',
      'POST:/api/users': 'users:write',
      'GET:/api/modules': 'modules:read',
      'POST:/api/modules': 'modules:write',
      'GET:/api/export': 'export:read',
      'POST:/api/export': 'export:write',
    };
    for (const [route, scope] of Object.entries(scopeMap)) {
      const [routeMethod, routePath] = route.split(':');
      if (routeMethod === method && path.startsWith(routePath)) {
        return this.hasScope(userId, scope);
      }
    }
    return true;
  }

  // ─── Admin Escalation Prevention ──────────────────────────────

  preventAdminEscalation(currentRole: string, targetRole: string, grantedByRole: string): boolean {
    if (!this.config.adminEscalationPrevention) return true;
    const hierarchy = ['viewer', 'member', 'editor', 'admin', 'superadmin'];
    const currentIdx = hierarchy.indexOf(currentRole);
    const targetIdx = hierarchy.indexOf(targetRole);
    const grantorIdx = hierarchy.indexOf(grantedByRole);
    if (targetIdx < 0 || currentIdx < 0 || grantorIdx < 0) return false;
    if (targetIdx > currentIdx + 1) return false;
    if (targetRole === 'superadmin' && grantorRole !== 'superadmin') return false;
    if (targetRole === 'admin' && grantorRole === currentRole) return false;
    return true;
  }

  requireElevation(currentRole: string, requiredRole: string): boolean {
    const hierarchy = ['viewer', 'member', 'editor', 'admin', 'superadmin'];
    return hierarchy.indexOf(currentRole) >= hierarchy.indexOf(requiredRole);
  }

  // ─── CSP Reporting ────────────────────────────────────────────

  getCspReportHeaders(): Record<string, string> {
    return {
      'Content-Security-Policy-Report-Only': this.buildCSP(),
      'Reporting-Endpoints': `csp-endpoint="${this.config.cspReportUri}"`,
    };
  }

  parseCspReport(reportBody: any): { blockedUri: string; violatedDirective: string; effectiveDirective: string; sourceFile?: string; lineNumber?: number } | null {
    try {
      const report = reportBody?.['csp-report'] || reportBody;
      return {
        blockedUri: report['blocked-uri'] || '',
        violatedDirective: report['violated-directive'] || '',
        effectiveDirective: report['effective-directive'] || '',
        sourceFile: report['source-file'],
        lineNumber: report['line-number'],
      };
    } catch {
      return null;
    }
  }

  // ─── Content Security Policy with Reporting ───────────────────

  // ─── Signed CDN URL Generation ─────────────────────────────────

  generateSignedCdnUrl(baseUrl: string, options: { expirySeconds?: number; ipRestriction?: string; userAgentRestriction?: string; key?: string } = {}): { url: string; expiresAt: string; signature: string } {
    const expiry = Date.now() + (options.expirySeconds || 3600) * 1000;
    const key = options.key || process.env.CDN_SIGNING_KEY || 'default-cdn-key';
    const path = new URL(baseUrl).pathname;
    const policy = JSON.stringify({
      path,
      expiry,
      ip: options.ipRestriction || '',
      ua: options.userAgentRestriction || '',
    });
    const signature = createHash('sha256').update(policy + key).digest('hex');
    const sep = baseUrl.includes('?') ? '&' : '?';
    const signedUrl = `${baseUrl}${sep}expires=${Math.floor(expiry / 1000)}&signature=${signature}`;
    return { url: signedUrl, expiresAt: new Date(expiry).toISOString(), signature };
  }

  // ─── WAF OWASP Ruleset Generation ───────────────────────────────

  generateWafRuleset(): Record<string, any> {
    return {
      name: 'sukit-owasp-core-ruleset',
      version: '3.3.5',
      paranoiaLevel: 1,
      rules: [
        { id: 942100, category: 'SQLi', severity: 'CRITICAL', description: 'SQL Injection Detected via libinjection', action: 'block', score: 10 },
        { id: 942110, category: 'SQLi', severity: 'CRITICAL', description: 'SQL Injection: common SQL comment sequences', action: 'block', score: 9 },
        { id: 942120, category: 'SQLi', severity: 'HIGH', description: 'SQL Injection: OR/AND operator detection', action: 'block', score: 8 },
        { id: 941100, category: 'XSS', severity: 'CRITICAL', description: 'XSS: libinjection detection', action: 'block', score: 10 },
        { id: 941110, category: 'XSS', severity: 'CRITICAL', description: 'XSS: event handler attribute', action: 'block', score: 9 },
        { id: 941120, category: 'XSS', severity: 'HIGH', description: 'XSS: script tag detection', action: 'block', score: 8 },
        { id: 941130, category: 'XSS', severity: 'HIGH', description: 'XSS: javascript: URI', action: 'block', score: 8 },
        { id: 941140, category: 'XSS', severity: 'MEDIUM', description: 'XSS: HTML entity encoding bypass', action: 'block', score: 6 },
        { id: 931100, category: 'RFI', severity: 'CRITICAL', description: 'Remote File Inclusion: absolute URL', action: 'block', score: 10 },
        { id: 931110, category: 'RFI', severity: 'HIGH', description: 'Remote File Inclusion: common RIF parameters', action: 'block', score: 8 },
        { id: 932100, category: 'LFI', severity: 'CRITICAL', description: 'Local File Inclusion: path traversal', action: 'block', score: 10 },
        { id: 932110, category: 'LFI', severity: 'HIGH', description: 'Local File Inclusion: common LFI parameters', action: 'block', score: 8 },
        { id: 933100, category: 'RCE', severity: 'CRITICAL', description: 'Remote Command Execution: command injection', action: 'block', score: 10 },
        { id: 933110, category: 'RCE', severity: 'HIGH', description: 'RCE: webshell detection', action: 'block', score: 9 },
        { id: 921100, category: 'CSRF', severity: 'HIGH', description: 'CSRF: missing anti-csrf token', action: 'block', score: 8 },
        { id: 921110, category: 'CSRF', severity: 'MEDIUM', description: 'CSRF: invalid or expired token', action: 'block', score: 6 },
        { id: 951100, category: 'PROTOCOL', severity: 'HIGH', description: 'HTTP Protocol Violation', action: 'block', score: 7 },
        { id: 951110, category: 'PROTOCOL', severity: 'MEDIUM', description: 'HTTP Parameter Pollution', action: 'block', score: 6 },
        { id: 934100, category: 'LDAPI', severity: 'CRITICAL', description: 'LDAP Injection', action: 'block', score: 9 },
        { id: 935100, category: 'SSTI', severity: 'CRITICAL', description: 'Server-Side Template Injection', action: 'block', score: 10 },
      ],
      anomalyThreshold: 7,
      blockingMode: 'anomaly-scoring',
      rulesets: ['sql-injection', 'xss', 'rfi-lfi', 'csrf', 'protocol', 'rce', 'ssti', 'ldapi'],
      remediation: {
        blockDuration: 300,
        responseCode: 403,
        responseBody: JSON.stringify({ error: 'Request blocked by WAF', code: 'WAF_BLOCKED', requestId: '%{request_id}' }),
        customHeaders: { 'X-WAF-Blocked': '1', 'X-WAF-Rule': '%{rule_id}' },
      },
    };
  }

  // ─── Incident Response Playbook Generation ──────────────────────

  generateIncidentResponsePlaybook(incidentType: 'data_breach' | 'ransomware' | 'dos' | 'insider_threat' | 'account_takeover' = 'data_breach'): Record<string, any> {
    const playbooks: Record<string, any> = {
      data_breach: {
        name: 'Data Breach Response Playbook',
        severity: 'CRITICAL',
        sla: { detection: '15min', analysis: '30min', containment: '1h', eradication: '4h', recovery: '8h', postMortem: '48h' },
        steps: [
          { phase: 'Detection', id: 'DET-001', action: 'Identify breach indicators from SIEM alerts, IDS/IPS, or user reports', assignee: 'SOC Analyst', tools: ['SIEM', 'EDR', 'IDS/IPS'], completionCriteria: 'Confirmed IOCs documented' },
          { phase: 'Detection', id: 'DET-002', action: 'Determine scope: affected systems, data types, user accounts', assignee: 'SOC Lead', tools: ['Asset Inventory', 'DLP', 'IAM'], completionCriteria: 'Scope document created' },
          { phase: 'Detection', id: 'DET-003', action: 'Capture forensic artifacts: logs, memory dumps, disk images', assignee: 'Forensic Analyst', tools: ['FTK Imager', 'Volatility', 'Wireshark'], completionCriteria: 'Evidence preserved with chain of custody' },
          { phase: 'Analysis', id: 'ANL-001', action: 'Analyze attack vector: phishing, exploit, credential theft', assignee: 'Threat Intel Analyst', tools: ['Threat Intel Platform', 'Sandbox'], completionCriteria: 'Attack vector identified' },
          { phase: 'Analysis', id: 'ANL-002', action: 'Determine data exfiltration: what data was accessed or stolen', assignee: 'Forensic Analyst', tools: ['DLP', 'NetFlow', 'Proxy Logs'], completionCriteria: 'Data impact assessment complete' },
          { phase: 'Analysis', id: 'ANL-003', action: 'Identify threat actor and TTPs using MITRE ATT&CK framework', assignee: 'Threat Intel Lead', tools: ['MITRE ATT&CK', 'Threat Intel Feeds'], completionCriteria: 'TTP mapping complete' },
          { phase: 'Containment', id: 'CTN-001', action: 'Isolate affected systems from network', assignee: 'Network Engineer', tools: ['Firewall', 'Switch ACLs', 'EDR'], completionCriteria: 'Systems isolated, lateral movement blocked' },
          { phase: 'Containment', id: 'CTN-002', action: 'Revoke compromised credentials and rotate secrets', assignee: 'IAM Team', tools: ['IAM', 'Secrets Manager', 'AD'], completionCriteria: 'All credentials rotated' },
          { phase: 'Containment', id: 'CTN-003', action: 'Block attacker infrastructure: IPs, domains, C2 servers', assignee: 'SOC Analyst', tools: ['Firewall', 'DNS Sinkhole', 'Proxy'], completionCriteria: 'Blocklist deployed' },
          { phase: 'Eradication', id: 'ERD-001', action: 'Remove malware, backdoors, persistence mechanisms', assignee: 'Incident Response Team', tools: ['EDR', 'Antivirus', 'Custom Scripts'], completionCriteria: 'Systems verified clean' },
          { phase: 'Eradication', id: 'ERD-002', action: 'Patch vulnerable systems and apply security updates', assignee: 'Patch Management', tools: ['WSUS', 'SCCM', 'Ansible'], completionCriteria: 'All patches verified' },
          { phase: 'Eradication', id: 'ERD-003', action: 'Rebuild compromised systems from known-good backups', assignee: 'Infrastructure Team', tools: ['Backup System', 'Terraform', 'Packer'], completionCriteria: 'Systems back in production' },
          { phase: 'Recovery', id: 'REC-001', action: 'Restore services in order of criticality', assignee: 'Service Owners', tools: ['Monitoring', 'Orchestrator'], completionCriteria: 'All critical services restored' },
          { phase: 'Recovery', id: 'REC-002', action: 'Monitor for recurrence: enhanced logging and alerting', assignee: 'SOC Team', tools: ['SIEM', 'UEBA', 'NTA'], completionCriteria: 'Monitoring period: 30 days' },
          { phase: 'Recovery', id: 'REC-003', action: 'Notify affected parties: customers, regulators, law enforcement', assignee: 'Legal & PR', tools: ['CRM', 'Email', 'Legal Hold'], completionCriteria: 'Notifications sent per regulatory requirements' },
          { phase: 'Post-Mortem', id: 'PM-001', action: 'Conduct post-incident review with all stakeholders', assignee: 'Incident Commander', tools: ['Confluence', 'Jira'], completionCriteria: 'Post-mortem document published' },
          { phase: 'Post-Mortem', id: 'PM-002', action: 'Identify root cause and implement preventative measures', assignee: 'Engineering Team', tools: ['Project Tracker', 'Code Review'], completionCriteria: 'Remediation tickets created' },
          { phase: 'Post-Mortem', id: 'PM-003', action: 'Update runbooks, playbooks, and detection rules', assignee: 'Security Team', tools: ['Git', 'SIEM', 'SOAR'], completionCriteria: 'Playbook updated and tested' },
        ],
      },
      ransomware: {
        name: 'Ransomware Response Playbook',
        severity: 'CRITICAL',
        sla: { detection: '5min', containment: '15min', eradication: '2h', recovery: '4h' },
        steps: [
          { phase: 'Detection', id: 'RAN-DET-001', action: 'Identify ransomware indicators: file encryption, ransom notes, extortion', assignee: 'SOC Analyst', tools: ['EDR', 'SIEM'], completionCriteria: 'Ransomware confirmed' },
          { phase: 'Containment', id: 'RAN-CTN-001', action: 'Immediately isolate affected endpoints and servers', assignee: 'Network Engineer', tools: ['EDR', 'Firewall'], completionCriteria: 'All affected systems isolated' },
          { phase: 'Containment', id: 'RAN-CTN-002', action: 'Disable SMB, RDP, and other lateral movement protocols', assignee: 'Network Engineer', tools: ['Firewall', 'GPO'], completionCriteria: 'Lateral movement blocked' },
          { phase: 'Eradication', id: 'RAN-ERD-001', action: 'Wipe and reimage infected systems', assignee: 'IT Team', tools: ['MDT', 'SCCM'], completionCriteria: 'Systems reimaged' },
          { phase: 'Recovery', id: 'RAN-REC-001', action: 'Restore from offline backups', assignee: 'Backup Team', tools: ['Backup System'], completionCriteria: 'Data restored' },
        ],
      },
    };
    return playbooks[incidentType] || playbooks.data_breach;
  }

  // ─── Breach Detection ──────────────────────────────────────────

  private breachEvents: { timestamp: number; source: string; score: number; indicator: string }[] = [];

  detectBreach(events: { source: string; indicator: string; severity: number; frequency: number }[]): {
    breached: boolean;
    confidence: number;
    anomalies: { source: string; indicator: string; score: number }[];
    alerts: { severity: string; message: string; action: string }[];
  } {
    const anomalies: { source: string; indicator: string; score: number }[] = [];
    const alerts: { severity: string; message: string; action: string }[] = [];
    let totalScore = 0;

    for (const event of events) {
      let score = event.severity * event.frequency;
      if (event.severity >= 8 && event.frequency > 5) score *= 2;
      if (event.severity >= 6 && event.frequency > 20) score *= 1.5;
      anomalies.push({ source: event.source, indicator: event.indicator, score: Math.round(score * 100) / 100 });
      totalScore += score;
      this.breachEvents.push({ timestamp: Date.now(), source: event.source, score, indicator: event.indicator });
    }

    if (totalScore > 100) {
      alerts.push({ severity: 'CRITICAL', message: `High-confidence breach detected (score: ${Math.round(totalScore)})`, action: 'Immediate incident response required' });
    } else if (totalScore > 50) {
      alerts.push({ severity: 'HIGH', message: `Suspicious activity detected (score: ${Math.round(totalScore)})`, action: 'Escalate to SOC for investigation' });
    } else if (totalScore > 20) {
      alerts.push({ severity: 'MEDIUM', message: `Anomalous behavior detected (score: ${Math.round(totalScore)})`, action: 'Monitor and review logs' });
    }

    if (this.breachEvents.length > 10000) this.breachEvents = this.breachEvents.slice(-5000);
    const confidence = Math.min(100, Math.round((totalScore / 150) * 100));

    return {
      breached: totalScore >= 50,
      confidence,
      anomalies,
      alerts,
    };
  }

  getBreachEvents(options?: { source?: string; since?: number }): { timestamp: number; source: string; score: number; indicator: string }[] {
    let events = this.breachEvents;
    if (options?.source) events = events.filter(e => e.source === options.source);
    if (options?.since) events = events.filter(e => e.timestamp >= options.since!);
    return events.slice(-100).reverse();
  }

  // ─── Forensic Logging Configuration ────────────────────────────

  generateForensicLoggingConfig(): Record<string, any> {
    return {
      version: '1.0',
      compliance: ['SOC 2', 'HIPAA', 'GDPR', 'PCI DSS', 'ISO 27001'],
      immutableLogging: {
        enabled: true,
        backend: 'aws-s3-object-lock',
        retentionMode: 'compliance',
        retentionPeriodDays: 2557,
        writeOnceReadMany: true,
        appendOnly: true,
        auditHashChain: {
          enabled: true,
          algorithm: 'sha256',
          chainInterval: 300,
          previousHashHeader: 'X-Log-Previous-Hash',
        },
      },
      chainOfCustody: {
        enabled: true,
        evidenceTracking: {
          evidenceIdHeader: 'X-Evidence-Id',
          custodyLog: true,
          accessLogging: true,
          tamperDetection: true,
        },
        loggingLevels: {
          security: { syslog: 'LOG_AUTH', windows: 'Security', cloudWatch: 'sukit/security' },
          application: { syslog: 'LOG_LOCAL0', cloudWatch: 'sukit/application' },
          audit: { syslog: 'LOG_AUTHPRIV', cloudWatch: 'sukit/audit' },
        },
        logSources: [
          { name: 'API Server', type: 'application', format: 'json' },
          { name: 'Authentication Service', type: 'security', format: 'cef' },
          { name: 'Database Audit', type: 'audit', format: 'json' },
          { name: 'Network Firewall', type: 'security', format: 'leef' },
          { name: 'WAF', type: 'security', format: 'json' },
          { name: 'CDN Edge', type: 'application', format: 'json' },
        ],
      },
      shipping: {
        protocol: 'tls',
        endpoints: [
          { destination: 'https://logs.sukit.dev/_bulk', method: 'POST', retry: { maxRetries: 5, backoffMs: 1000 } },
          { destination: 's3://sukit-forensic-logs/', method: 'S3_PUT', interval: 300 },
        ],
        compression: 'gzip',
        bufferSize: 10000,
        flushInterval: 10,
      },
      alerting: {
        onLogFailure: { enabled: true, severity: 'HIGH', notify: ['security-team@sukit.dev'] },
        onTamperDetected: { enabled: true, severity: 'CRITICAL', notify: ['incident-response@sukit.dev'] },
      },
    };
  }

  buildCspWithReport(): string {
    const directives = { ...this.config.cspDirectives };
    if (this.config.cspReportUri) {
      directives['report-uri'] = [this.config.cspReportUri];
      directives['report-to'] = ['csp-endpoint'];
    }
    return Object.entries(directives)
      .map(([key, values]) => `${key} ${values.join(' ')}`)
      .join('; ');
  }
}
