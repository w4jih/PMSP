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
import handler from '../pages/api/passagers/[id]';
import { prisma } from './__mocks__/prisma';

describe('Passagers /api/passagers/[id] (with JWT auth)', () => {
  let server: any;

  beforeAll(() => {
    server = createTestServer(handler);
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
    jest.resetAllMocks();
  });

  // ---------------- GET TESTS -----------------
  describe('GET /api/passagers/[id]', () => {
    it('should return 401 when no Authorization header is provided', async () => {
      const res = await request(server).get('/?id=1');
      expect(res.status).toBe(401);
    });

    it('should return passager for valid token', async () => {
      (prisma.passager.findMany as jest.Mock).mockResolvedValue([
        { id: 1, name: 'John', lastname: 'Doe', Cin: '12345' },
      ]);

      const res = await request(server)
        .get('/?id=1')
        .set('Authorization', 'Bearer valid-admin-token');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([{ id: 1, name: 'John', lastname: 'Doe', Cin: '12345' }]);
    });

    it('should return 500 if Prisma throws', async () => {
      (prisma.passager.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(server)
        .get('/?id=1')
        .set('Authorization', 'Bearer valid-admin-token');

      expect(res.status).toBe(500);
    });
  });

  // ---------------- DELETE TESTS -----------------
  describe('DELETE /api/passagers/[id]', () => {
    it('should return 400 if id is missing', async () => {
      const res = await request(server)
        .delete('/')
        .set('Authorization', 'Bearer valid-admin-token');

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'missing id');
    });

    it('should delete passager successfully', async () => {
      (prisma.passager.delete as jest.Mock).mockResolvedValue({ id: 1 });

      const res = await request(server)
        .delete('/?id=1')
        .set('Authorization', 'Bearer valid-admin-token');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty(
        'message',
        'Conducteur with the ID 1 was seccessfuly deleted'
      );
    });

    it('should return 500 if Prisma throws on DELETE', async () => {
      (prisma.passager.delete as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(server)
        .delete('/?id=1')
        .set('Authorization', 'Bearer valid-admin-token');

      expect(res.status).toBe(500);
    });
  });

  // ---------------- PUT TESTS -----------------
  describe('PUT /api/passagers/[id]', () => {
    it('should return 400 if id is missing', async () => {
      const res = await request(server)
        .put('/')
        .set('Authorization', 'Bearer valid-admin-token')
        .send({ name: 'John', lastname: 'Doe', Cin: '12345', password: '123456' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'missing id');
    });

    it('should update passager successfully', async () => {
      (prisma.passager.update as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Updated',
        lastname: 'User',
        Cin: '98765',
      });

      const res = await request(server)
        .put('/?id=1')
        .set('Authorization', 'Bearer valid-admin-token')
        .send({ name: 'Updated', lastname: 'User', Cin: '98765', password: '123456' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty(
        'message',
        'Conducteur with the ID 1 was seccessfuly updated'
      );
    });

    it('should return 500 if Prisma throws on PUT', async () => {
      (prisma.passager.update as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(server)
        .put('/?id=1')
        .set('Authorization', 'Bearer valid-admin-token')
        .send({ name: 'Updated', lastname: 'User', Cin: '98765', password: '123456' });

      expect(res.status).toBe(500);
    });
  });
});
