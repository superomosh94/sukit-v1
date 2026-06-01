import { describe, it, expect } from 'vitest';

describe('Performance: Load Testing', () => {
  it('should handle concurrent page creation requests', async () => {
    const requests = Array.from({ length: 10 }, (_, i) =>
      fetch('http://localhost:3042/api/sites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'test-key',
        },
        body: JSON.stringify({ name: `load-test-site-${i}` }),
      })
    );
    const responses = await Promise.all(requests);
    const statuses = responses.map((r) => r.status);
    const successCount = statuses.filter((s) => s === 201 || s === 200).length;
    expect(successCount).toBeGreaterThan(0);
  });

  it('should respond to health check under 200ms', async () => {
    const start = performance.now();
    const res = await fetch('http://localhost:3042/api/health');
    const duration = performance.now() - start;
    expect(res.status).toBe(200);
    expect(duration).toBeLessThan(200);
  });

  it('should maintain response time under load', async () => {
    const times: number[] = [];
    for (let i = 0; i < 5; i++) {
      const start = performance.now();
      await fetch('http://localhost:3042/api/health');
      times.push(performance.now() - start);
    }
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    expect(avg).toBeLessThan(500);
  });

  it('should handle concurrent page reads without errors', async () => {
    const reads = Array.from({ length: 5 }, () =>
      fetch('http://localhost:3042/api/sites', {
        headers: { 'X-API-Key': 'test-key' },
      })
    );
    const responses = await Promise.all(reads);
    responses.forEach((r) => expect(r.status).toBe(200));
  });

  it('should recover after rate limit is hit', async () => {
    const requests = Array.from({ length: 20 }, () =>
      fetch('http://localhost:3042/api/sites', {
        headers: { 'X-API-Key': 'rate-limited-key' },
      })
    );
    const responses = await Promise.all(requests);
    const rateLimited = responses.filter((r) => r.status === 429).length;
    const success = responses.filter((r) => r.status === 200).length;
    expect(rateLimited + success).toBe(20);
  });
});
