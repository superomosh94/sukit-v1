import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SecuritySystem } from '../../production/security/src/index';
import { createHash } from 'crypto';

const mockKernel = {
  events: { emit: vi.fn() },
  cache: { get: vi.fn(), set: vi.fn() },
  db: {} as any,
} as any;

describe('SecuritySystem', () => {
  let security: SecuritySystem;

  beforeEach(() => {
    security = new SecuritySystem(mockKernel);
  });

  describe('Password Security', () => {
    it('hashes and verifies passwords correctly', async () => {
      const password = 'TestPass123!';
      const hash = await security.hashPassword(password);
      expect(hash).toContain(':');
      const verified = await security.verifyPassword(password, hash);
      expect(verified).toBe(true);
    });

    it('rejects wrong passwords', async () => {
      const hash = await security.hashPassword('RealPass1!');
      const verified = await security.verifyPassword('WrongPass1!', hash);
      expect(verified).toBe(false);
    });

    it('validates password strength', () => {
      const weak = security.validatePasswordStrength('short');
      expect(weak.valid).toBe(false);
      expect(weak.errors.length).toBeGreaterThan(0);

      const strong = security.validatePasswordStrength('Str0ng!Pass');
      expect(strong.valid).toBe(true);
      expect(strong.errors.length).toBe(0);
    });
  });

  describe('Password History', () => {
    it('enforces password history', () => {
      security.recordPasswordChange('user1', 'hash1');
      security.recordPasswordChange('user1', 'hash2');
      const allowed = security.checkPasswordHistory('user1', 'hash1');
      expect(allowed).toBe(false);
    });

    it('tracks password age', () => {
      security.recordPasswordChange('user2', 'newhash');
      expect(security.getPasswordAge('user2')).toBeLessThan(1);
    });

    it('detects expired passwords', () => {
      const expired = security.isPasswordExpired('unknown-user');
      expect(expired).toBe(true);
    });
  });

  describe('Session Security', () => {
    it('generates valid sessions', () => {
      const session = security.generateSession();
      expect(session.token).toBeTruthy();
      expect(session.token.length).toBe(96);
      expect(session.expiresAt > new Date()).toBe(true);
    });

    it('validates session expiry', () => {
      const valid = security.validateSession({
        token: 'abc',
        expiresAt: new Date(Date.now() + 3600000),
      });
      expect(valid).toBe(true);

      const expired = security.validateSession({
        token: 'abc',
        expiresAt: new Date(Date.now() - 3600000),
      });
      expect(expired).toBe(false);
    });

    it('rotates sessions on privilege escalation', () => {
      const session = security.generateSession();
      security.trackSession('user1', session.token);
      const rotated = security.rotateSession('user1', session.token);
      expect(rotated).toBeTruthy();
      expect(rotated!.token).not.toBe(session.token);
    });

    it('tracks active sessions per user', () => {
      const s1 = security.generateSession();
      const s2 = security.generateSession();
      security.trackSession('user3', s1.token);
      security.trackSession('user3', s2.token);
      expect(security.getActiveSessions('user3')).toBe(2);
    });
  });

  describe('Login Rate Limiting', () => {
    it('blocks after max attempts', () => {
      for (let i = 0; i < 10; i++) {
        security.checkLoginAttempt('attacker');
      }
      const result = security.checkLoginAttempt('attacker');
      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('resets after lockout', () => {
      for (let i = 0; i < 10; i++) {
        security.checkLoginAttempt('reset-user');
      }
      security.resetLoginAttempts('reset-user');
      const result = security.checkLoginAttempt('reset-user');
      expect(result.allowed).toBe(true);
    });
  });

  describe('Input Sanitization', () => {
    it('sanitizes HTML', () => {
      const input = '<script>alert("xss")</script><p>hello</p>';
      const sanitized = security.sanitizeDom(input);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('<p>');
    });

    it('sanitizes URLs', () => {
      expect(security.sanitizeUrl('https://safe.com')).toBe(
        'https://safe.com/'
      );
      expect(security.sanitizeUrl('javascript:alert(1)')).toBe('');
      expect(security.sanitizeUrl('http://safe.com')).toBe('http://safe.com/');
    });

    it('sanitizes filenames', () => {
      expect(security.sanitizeFilename('test.exe')).toContain('.blocked');
      expect(security.sanitizeFilename('photo.jpg')).toBe('photo.jpg');
    });
  });

  describe('WebAuthn / Passkeys', () => {
    it('generates registration options', () => {
      const options = security.generateWebAuthnRegistrationOptions(
        'user1',
        'test@test.com'
      );
      expect(options.challenge).toBeTruthy();
      expect(options.rp.name).toBe('SUKIT');
      expect(options.pubKeyCredParams.length).toBeGreaterThan(0);
    });
  });

  describe('API Scope Validation', () => {
    it('validates API scopes', () => {
      security.setUserScopes('user1', ['sites:read', 'pages:write']);
      expect(security.hasScope('user1', 'sites:read')).toBe(true);
      expect(security.hasScope('user1', 'sites:write')).toBe(false);
      expect(security.hasScope('user1', 'pages:write')).toBe(true);
    });

    it('validates scopes by endpoint', () => {
      security.setUserScopes('user1', ['sites:read']);
      expect(security.validateApiScope('user1', 'GET', '/api/sites')).toBe(
        true
      );
      expect(security.validateApiScope('user1', 'POST', '/api/sites')).toBe(
        false
      );
    });
  });

  describe('Admin Escalation Prevention', () => {
    it('prevents direct admin escalation', () => {
      const allowed = security.preventAdminEscalation(
        'member',
        'admin',
        'member'
      );
      expect(allowed).toBe(false);
    });

    it('allows valid promotion', () => {
      const allowed = security.preventAdminEscalation(
        'admin',
        'superadmin',
        'superadmin'
      );
      expect(allowed).toBe(true);
    });
  });

  describe('Rate Limiting Headers', () => {
    it('returns RFC-compliant headers', () => {
      const headers = security.getRateLimitHeaders('test-key');
      expect(headers['X-RateLimit-Limit']).toBeTruthy();
      expect(headers['X-RateLimit-Remaining']).toBeTruthy();
      expect(headers['X-RateLimit-Reset']).toBeTruthy();
    });
  });
});
