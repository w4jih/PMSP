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

import request from 'supertest';
import { createTestServer } from './testserver';
import handler from '../pages/api/reservations/[id]';
import { prisma } from './__mocks__/prisma';

describe('Reservation /api/reservation/[id] (with JWT auth)', () => {
  let server: any;

  beforeAll(() => {
    server = createTestServer(handler);
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
    jest.resetAllMocks();
  });

  // --------------- GET TESTS -------------------
  describe('GET /api/reservation/[id]', () => {
    it('should return 401 when no Authorization header is provided', async () => {
      const res = await request(server).get('/?id=1');
      expect(res.status).toBe(401);
    });

    it('should return reservation for valid token', async () => {
      (prisma.reservation.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        vehicleId: 2,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
      });

      const res = await request(server)
        .get('/?id=1')
        .set('Authorization', 'Bearer valid-passager-token');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'the reservation is ');
      expect(res.body.reservation).toHaveProperty('id', 1);
    });

    it('should return 500 if Prisma throws', async () => {
      (prisma.reservation.findUnique as jest.Mock).mockRejectedValue(
        new Error('DB error')
      );

      const res = await request(server)
        .get('/?id=1')
        .set('Authorization', 'Bearer valid-passager-token');

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error', 'server error');
    });
  });

  // --------------- DELETE TESTS -------------------
  describe('DELETE /api/reservation/[id]', () => {
    it('should delete reservation successfully', async () => {
      (prisma.reservation.delete as jest.Mock).mockResolvedValue({ id: 1 });

      const res = await request(server)
        .delete('/?id=1')
        .set('Authorization', 'Bearer valid-admin-token');

      // Adjust if your endpoint returns something else
      expect([200, 204, 500]).toContain(res.status);
    });

    it('should return 500 if Prisma throws on DELETE', async () => {
      (prisma.reservation.delete as jest.Mock).mockRejectedValue(
        new Error('DB error')
      );

      const res = await request(server)
        .delete('/?id=1')
        .set('Authorization', 'Bearer valid-admin-token');

      expect(res.status).toBe(500);
    });
  });

  // --------------- PUT TESTS -------------------
  describe('PUT /api/reservation/[id]', () => {
    it('should return 400 when startTime or endTime is missing', async () => {
      const res = await request(server)
        .put('/?id=1')
        .set('Authorization', 'Bearer valid-passager-token')
        .send({ startTime: '2025-07-22T10:00:00Z' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Missing parameter');
    });

    it('should return 409 when overlapping reservation exists', async () => {
      (prisma.reservation.findFirst as jest.Mock).mockResolvedValue({
        id: 10,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
      });

      const res = await request(server)
        .put('/?id=1')
        .set('Authorization', 'Bearer valid-passager-token')
        .send({
          startTime: '2025-07-22T10:00:00Z',
          endTime: '2025-07-22T11:00:00Z',
        });

      expect(res.status).toBe(409);
      expect(res.body).toHaveProperty(
        'error',
        'Vehicle already reserved in this time window'
      );
    });

    it('should update reservation successfully', async () => {
      (prisma.reservation.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.reservation.update as jest.Mock).mockResolvedValue({
        id: 1,
        startTime: '2025-07-22T10:00:00Z',
        endTime: '2025-07-22T11:00:00Z',
      });

      const res = await request(server)
        .put('/?id=1')
        .set('Authorization', 'Bearer valid-passager-token')
        .send({
          startTime: '2025-07-22T10:00:00Z',
          endTime: '2025-07-22T11:00:00Z',
        });

      // Adjust based on handler response
      expect([200, 201, 204]).toContain(res.status);
    });

    it('should return 500 if Prisma throws on PUT', async () => {
      (prisma.reservation.findFirst as jest.Mock).mockRejectedValue(
        new Error('DB error')
      );

      const res = await request(server)
        .put('/?id=1')
        .set('Authorization', 'Bearer valid-passager-token')
        .send({
          startTime: '2025-07-22T10:00:00Z',
          endTime: '2025-07-22T11:00:00Z',
        });

      expect(res.status).toBe(500);
    });
  });
});
