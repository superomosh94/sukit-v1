import { describe, it, expect, beforeAll } from 'vitest';

const API_BASE = 'http://localhost:3042/api';
const TEST_SITE = { name: 'Export Test Site', template: 'blank' };

let siteId: string;

describe('Export API Integration', () => {
  beforeAll(async () => {
    const res = await fetch(`${API_BASE}/sites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': 'test-key' },
      body: JSON.stringify(TEST_SITE),
    });
    const data = await res.json();
    siteId = data.id || data.site?.id;
  });

  it('should start an export with valid site ID', async () => {
    const res = await fetch(`${API_BASE}/sites/${siteId}/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': 'test-key' },
      body: JSON.stringify({ format: 'zip' }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('exportId');
  });

  it('should return 404 for non-existent site export', async () => {
    const res = await fetch(`${API_BASE}/sites/non-existent-id/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': 'test-key' },
    });
    expect(res.status).toBe(404);
  });

  it('should reject export without API key', async () => {
    const res = await fetch(`${API_BASE}/sites/${siteId}/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status).toBe(401);
  });

  it('should return export progress', async () => {
    const res = await fetch(`${API_BASE}/sites/${siteId}/export/progress`, {
      headers: { 'X-API-Key': 'test-key' },
    });
    expect([200, 404]).toContain(res.status);
  });

  it('should handle export cancellation', async () => {
    const res = await fetch(`${API_BASE}/sites/${siteId}/export/cancel`, {
      method: 'POST',
      headers: { 'X-API-Key': 'test-key' },
    });
    expect([200, 404]).toContain(res.status);
  });

  it('should reject export with invalid format', async () => {
    const res = await fetch(`${API_BASE}/sites/${siteId}/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': 'test-key' },
      body: JSON.stringify({ format: 'invalid' }),
    });
    expect(res.status).toBe(400);
  });
});
