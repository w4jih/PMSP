// Mock withAuthorization
jest.mock('../lib/withAuthorization', () => {
  return {
    withAuthorization: (roles: string[], handler: any) => {
      return (req: any, res: any) => {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
          return res.status(401).json({ error: 'Unauthorized' });
        }
        const token = authHeader.replace('Bearer ', '');
        if (token !== 'valid-admin-token') {
          return res.status(403).json({ error: 'Forbidden' });
        }
        return handler(req, res);
      };
    },
  };
});

import request from 'supertest';
import { createTestServer } from './testserver';
import handler from '../pages/api/vehicule'; // Adjust path as needed
import { prisma } from './__mocks__/prisma';

describe('GET /api/vehicule (with JWT auth)', () => {
  let server: any;

  beforeAll(() => {
    server = createTestServer(handler);
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
    jest.resetAllMocks();
  });

  it('should return 401 when no Authorization header is provided', async () => {
    const res = await request(server).get('/');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Unauthorized');
  });

  it('should return 403 when an invalid token is provided', async () => {
    const res = await request(server)
      .get('/')
      .set('Authorization', 'Bearer invalid-token');
    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error', 'Forbidden');
  });

  it('should return vehicules with valid admin token', async () => {
    (prisma.vehicule.findMany as jest.Mock).mockResolvedValue([
      {id: 2, name: 'rrrr', type: 'bmw', conducteurId: 1, available: true},
    ]);

    const res = await request(server)
      .get('/')
      .set('Authorization', 'Bearer valid-admin-token');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {id: 2, name: 'rrrr', type: 'bmw', conducteurId: 1, available: true},
    ]);
  });

  it('should return 500 if Prisma throws an error', async () => {
    (prisma.vehicule.findMany as jest.Mock).mockRejectedValue(new Error('DB Error'));

    const res = await request(server)
      .get('/')
      .set('Authorization', 'Bearer valid-admin-token');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('err');
  });
});