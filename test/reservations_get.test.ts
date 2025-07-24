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
        if (token !== 'valid-admin-token' && token !== 'valid-passager-token') {
          return res.status(403).json({ error: 'Forbidden' });
        }
        return handler(req, res);
      };
    },
  };
});

// Mock verifyToken (even if not directly used in GET)
jest.mock('../lib/auth', () => ({
  verifyToken: jest.fn().mockReturnValue({ id: 123 }),
}));

import request from 'supertest';
import { createTestServer } from './testserver';
import handler from '../pages/api/reservations'; // adjust the path to your file
import { prisma } from './__mocks__/prisma';

describe('GET /api/reservations (with JWT auth)', () => {
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

  it('should return reservations with valid admin token', async () => {
    (prisma.reservation.findMany as jest.Mock).mockResolvedValue([
      { id: 1, userId: 123, vehicleId: 2, startTime: new Date(), endTime: new Date() },
    ]);

    const res = await request(server)
      .get('/')
      .set('Authorization', 'Bearer valid-admin-token');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'the reservations are');
    expect(res.body.reservations).toEqual([
      { id: 1, userId: 123, vehicleId: 2, startTime: expect.any(String), endTime: expect.any(String) },
    ]);
  });

  it('should return 500 if Prisma throws an error', async () => {
    (prisma.reservation.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(server)
      .get('/')
      .set('Authorization', 'Bearer valid-admin-token');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'server error');
  });
});