import {
  createHash,
  randomBytes,
  createCipheriv,
  createDecipheriv,
  timingSafeEqual,
} from 'crypto';
import type { SukitKernel } from '@sukit/core';

export interface SecurityConfig {
  bcryptRounds: number;
  sessionTimeout: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
  passwordMinLength: number;
  passwordHistory: number;
  apiKeyExpiryDays: number;
  rateLimitGlobal: number;
  rateLimitAuth: number;
  rateLimitUser: number;
  maxFileSize: number;
  allowedOrigins: string[];
  cspDirectives: Record<string, string[]>;
}

const DEFAULT_CONFIG: SecurityConfig = {
  bcryptRounds: 12,
  sessionTimeout: 28800,
  maxLoginAttempts: 10,
  lockoutDuration: 1800,
  passwordMinLength: 8,
  passwordHistory: 5,
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
};

export class SecuritySystem {
  private kernel: SukitKernel;
  private config: SecurityConfig;
  private loginAttempts: Map<string, { count: number; lockedUntil: number }> =
    new Map();
  private rateLimits: Map<string, { count: number; resetAt: number }> =
    new Map();

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
}
