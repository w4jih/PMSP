// Mock withAuthorization
jest.mock('../lib/withAuthorization', () => {
  return {
    withAuthorization: (roles: string[], handler: any) => {
      return (req: any, res: any) => {
        const authHeader = req.headers['authorization'];
        if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
        const token = authHeader.replace('Bearer ', '');
        if (
          token !== 'valid-admin-token' &&
          token !== 'valid-conducteur-token' &&
          token !== 'valid-passager-token'
        ) {
          return res.status(403).json({ error: 'Forbidden' });
        }
        return handler(req, res);
      };
    },
  };
});

// Mock axios
jest.mock('axios');
import axios from 'axios';

import request from 'supertest';
import { createTestServer } from './testserver';
import handler from '../pages/api/routing/route';

describe('GET /api/routing/route (with JWT auth)', () => {
  let server: any;

  beforeAll(() => {
    process.env.ORS_API_KEY = 'test-api-key';
    server = createTestServer(handler);
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
    jest.resetAllMocks();
  });

  it('should return 401 if no Authorization header', async () => {
    const res = await request(server).get('/');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Unauthorized');
  });

  it('should return 403 if invalid token is provided', async () => {
    const res = await request(server)
      .get('/')
      .set('Authorization', 'Bearer invalid-token');
    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error', 'Forbidden');
  });

  it('should return 405 if method is not GET', async () => {
    const res = await request(server)
      .post('/')
      .set('Authorization', 'Bearer valid-admin-token');
    expect(res.status).toBe(405);
    expect(res.body).toHaveProperty('error', 'Method not allowed');
  });

  it('should return 400 if query params are missing', async () => {
    const res = await request(server)
      .get('/')
      .set('Authorization', 'Bearer valid-admin-token');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Missing coordinates');
  });

  it('should return 200 with distance and duration on success', async () => {
    (axios.post as jest.Mock).mockResolvedValue({
      data: {
        routes: [
          {
            summary: { distance: 5000, duration: 600 }, // 5km and 10min
          },
        ],
      },
    });

    const res = await request(server)
      .get('/?fromLat=10&fromLng=20&toLat=30&toLng=40')
      .set('Authorization', 'Bearer valid-admin-token');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('distanceKm', 5);
    expect(res.body).toHaveProperty('durationMin', 10);
  });

  it('should return 500 if OpenRouteService fails', async () => {
    (axios.post as jest.Mock).mockRejectedValue(new Error('ORS error'));

    const res = await request(server)
      .get('/?fromLat=10&fromLng=20&toLat=30&toLng=40')
      .set('Authorization', 'Bearer valid-admin-token');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Failed to fetch route data');
  });
});
