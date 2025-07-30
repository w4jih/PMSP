// Mock withAuthorization to bypass JWT validation
jest.mock('../lib/withAuthorization', () => {
  return {
    withAuthorization: (roles: string[], handler: any) => {
      return (req: any, res: any) => {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
          return res.status(401).json({ error: 'Unauthorized' });
        }
        const token = authHeader.replace('Bearer ', '');
        if (token !== 'valid-admin-token' && token !== 'valid-conducteur-token') {
          return res.status(403).json({ error: 'Forbidden' });
        }
        return handler(req, res);
      };
    },
  };
});

import request from 'supertest';
import { createTestServer } from './testserver';
import handler from '../pages/api/conducteurs/[id]';
jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
   conducteur: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  },
  },
}));
import prisma from '../lib/prisma';



describe('Conducteurs /api/conducteurs/[id] (with JWT auth)', () => {
  let server: any;

  beforeAll(() => {
    server = createTestServer(handler);
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
    jest.resetAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------------- GET TESTS -----------------
  describe('GET /api/conducteurs/[id]', () => {
    it('should return 401 if no Authorization header', async () => {
      const res = await request(server).get('/?id=1');
      expect(res.status).toBe(401);
    });

    it('should return conducteur for valid token', async () => {
      (prisma.conducteur.findMany as jest.Mock).mockResolvedValue([
        { id: 1, name: 'John', lastname: 'Doe', Cin: 'C12345', email: 'john@example.com' },
      ]);

      const res = await request(server)
        .get('/?id=1')
        .set('Authorization', 'Bearer valid-admin-token');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([
        { id: 1, name: 'John', lastname: 'Doe', Cin: 'C12345', email: 'john@example.com' },
      ]);
    });

    it('should return 500 if Prisma throws', async () => {
      (prisma.conducteur.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(server)
        .get('/?id=1')
        .set('Authorization', 'Bearer valid-admin-token');

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error', 'server error');
    });
  });

  // ---------------- DELETE TESTS -----------------
  describe('DELETE /api/conducteurs/[id]', () => {
    it('should return 400 if id is missing', async () => {
      const res = await request(server)
        .delete('/')
        .set('Authorization', 'Bearer valid-admin-token');

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Missing ID');
    });

    it('should delete conducteur successfully', async () => {
      (prisma.conducteur.delete as jest.Mock).mockResolvedValue({ id: 1 });

      const res = await request(server)
        .delete('/?id=1')
        .set('Authorization', 'Bearer valid-admin-token');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Conducteur with ID 1 deleted');
    });

    it('should return 500 if Prisma throws on DELETE', async () => {
      (prisma.conducteur.delete as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(server)
        .delete('/?id=1')
        .set('Authorization', 'Bearer valid-admin-token');

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error', 'Error deleting conducteur');
    });
  });

  // ---------------- PUT TESTS -----------------
  describe('PUT /api/conducteurs/[id]', () => {
    it('should update conducteur successfully', async () => {
      (prisma.conducteur.update as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Updated',
        lastname: 'User',
        Cin: 'C98765',
        email: 'updated@example.com',
      });

      const res = await request(server)
        .put('/?id=1')
        .set('Authorization', 'Bearer valid-admin-token')
        .send({
          name: 'Updated',
          lastname: 'User',
          Cin: 'C98765',
          email: 'updated@example.com',
          password: '123456',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Conducteur with ID 1 updated');
    });

    it('should return 500 if Prisma throws on PUT', async () => {
      (prisma.conducteur.update as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(server)
        .put('/?id=1')
        .set('Authorization', 'Bearer valid-admin-token')
        .send({
          name: 'Updated',
          lastname: 'User',
          Cin: 'C98765',
          email: 'updated@example.com',
          password: '123456',
        });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error', 'Error updating conducteur');
    });
  });
});
