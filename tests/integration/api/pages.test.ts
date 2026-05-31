import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createServer } from '@/app/api/test-server';

let app: Awaited<ReturnType<typeof createServer>>;

beforeAll(async () => {
  app = await createServer();
});

afterAll(async () => {
  await app.teardown();
});

describe('Pages API', () => {
  let siteId: string;
  let pageId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/sites')
      .set('Authorization', 'Bearer test-token')
      .send({ name: 'Test Site', domain: 'test.example.com' });
    siteId = res.body.id;
  });

  it('POST creates page', async () => {
    const res = await request(app)
      .post(`/api/sites/${siteId}/pages`)
      .set('Authorization', 'Bearer test-token')
      .send({
        title: 'Home',
        slug: 'home',
        content: { sections: [] },
      });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Home');
    pageId = res.body.id;
  });

  it('GET returns page with sections', async () => {
    const res = await request(app)
      .get(`/api/pages/${pageId}`)
      .set('Authorization', 'Bearer test-token');
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Home');
    expect(res.body.content).toBeDefined();
  });

  it('PUT updates page content', async () => {
    const res = await request(app)
      .put(`/api/pages/${pageId}`)
      .set('Authorization', 'Bearer test-token')
      .send({
        title: 'Updated Home',
        content: {
          sections: [{ id: 'sec-1', type: 'empty', blocks: [], settings: {} }],
        },
      });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated Home');
    expect(res.body.content.sections).toHaveLength(1);
  });

  it('DELETE removes page', async () => {
    const res = await request(app)
      .delete(`/api/pages/${pageId}`)
      .set('Authorization', 'Bearer test-token');
    expect(res.status).toBe(204);

    const getRes = await request(app)
      .get(`/api/pages/${pageId}`)
      .set('Authorization', 'Bearer test-token');
    expect(getRes.status).toBe(404);
  });
});
