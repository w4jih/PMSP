// Mock withAuthorization
/*jest.mock('../lib/withAuthorization', () => {
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
        return handler(req, res); // Call original handler
      };
    },
  };
});

import request from 'supertest';
import { createTestServer } from './testserver';
import handler from '../pages/api/vehicule/[id]';
import { prisma } from './__mocks__/prisma';

describe('Vehicule [id] Endpoint (with JWT auth)', () => {
  let server: any;

  beforeAll(() => {
    server = createTestServer(handler);
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
    jest.resetAllMocks();
  });

  // -------- GET Tests --------
  describe('GET /api/vehicule/[id]', () => {
    it('should return 401 if no Authorization header', async () => {
      const res = await request(server).get('/?id=1');
      expect(res.status).toBe(401);
    });

    it('should return 400 if id is invalid', async () => {
      const res = await request(server)
        .get('/?id=abc')
        .set('Authorization', 'Bearer valid-admin-token');
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Invalid id');
    });

    it('should return 404 if vehicule not found', async () => {
      (prisma.vehicule.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(server)
        .get('/?id=99')
        .set('Authorization', 'Bearer valid-admin-token');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'vehicule not found');
    });

    it('should return vehicule if found', async () => {
      (prisma.vehicule.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Toyota',
        type: 'SUV',
      });

      const res = await request(server)
        .get('/?id=1')
        .set('Authorization', 'Bearer valid-admin-token');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ id: 1, name: 'Toyota', type: 'SUV' });
    });

    it('should return 500 if Prisma throws', async () => {
      (prisma.vehicule.findUnique as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(server)
        .get('/?id=1')
        .set('Authorization', 'Bearer valid-admin-token');
      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error', 'server error');
    });
  });

  // -------- DELETE Tests --------
  describe('DELETE /api/vehicule/[id]', () => {
    it('should delete vehicule successfully', async () => {
      (prisma.vehicule.delete as jest.Mock).mockResolvedValue({ id: 1 });

      const res = await request(server)
        .delete('/?id=1')
        .set('Authorization', 'Bearer valid-admin-token');
      expect(res.status).toBe(200); // Adjust this when endpoint returns a success response
    });

    it('should return 500 if Prisma throws on DELETE', async () => {
      (prisma.vehicule.delete as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(server)
        .delete('/?id=1')
        .set('Authorization', 'Bearer valid-admin-token');
      expect(res.status).toBe(500);
    });
  });

  // -------- PUT Tests --------
  describe('PUT /api/vehicule/[id]', () => {
    it('should return 400 for invalid name/type', async () => {
      const res = await request(server)
        .put('/?id=1')
        .set('Authorization', 'Bearer valid-admin-token')
        .send({ name: 123, type: [] });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Invalid name or type');
    });

    it('should update vehicule successfully', async () => {
      (prisma.vehicule.update as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'UpdatedCar',
        type: 'Truck',
      });

      const res = await request(server)
        .put('/?id=1')
        .set('Authorization', 'Bearer valid-admin-token')
        .send({ name: 'UpdatedCar', type: 'Truck' });
      expect(res.status).toBe(200);
    });

    it('should return 500 if Prisma throws on PUT', async () => {
      (prisma.vehicule.update as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(server)
        .put('/?id=1')
        .set('Authorization', 'Bearer valid-admin-token')
        .send({ name: 'Test', type: 'SUV' });
      expect(res.status).toBe(500);
    });
  });
});
*/
// Correctly mock the prisma instance used by the handler
jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
    vehicule: {
      findUnique: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
  },
}));
import prisma from '../lib/prisma';
// -------- MOCK withAuthorization --------
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

// -------- MOCK Prisma --------
jest.mock('./__mocks__/prisma');


import request from 'supertest';
import { createTestServer } from './testserver';
import handler from '../pages/api/vehicule/[id]';

describe('Vehicule [id] Endpoint (with JWT auth)', () => {
  let server: any;

  beforeAll(() => {
    server = createTestServer(handler);
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
    jest.resetAllMocks();
  });

  // -------- GET Tests --------
  describe('GET /api/vehicule/[id]', () => {
    it('should return 401 if no Authorization header', async () => {
      const res = await request(server).get('/?id=1');
      expect(res.status).toBe(401);
    });

    it('should return 400 if id is invalid', async () => {
      const res = await request(server)
        .get('/?id=abc')
        .set('Authorization', 'Bearer valid-admin-token');
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Invalid id');
    });

    it('should return 404 if vehicule not found', async () => {
      (prisma.vehicule.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(server)
        .get('/?id=99')
        .set('Authorization', 'Bearer valid-admin-token');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'vehicule not found');
    });

    it('should return vehicule if found', async () => {
      (prisma.vehicule.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Toyota',
        type: 'SUV',
      });

      const res = await request(server)
        .get('/?id=1')
        .set('Authorization', 'Bearer valid-admin-token');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ id: 1, name: 'Toyota', type: 'SUV' });
    });

    it('should return 500 if Prisma throws', async () => {
      (prisma.vehicule.findUnique as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(server)
        .get('/?id=1')
        .set('Authorization', 'Bearer valid-admin-token');
      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error', 'server error');
    });
  });

  // -------- DELETE Tests --------
  describe('DELETE /api/vehicule/[id]', () => {
    it('should delete vehicule successfully', async () => {
      (prisma.vehicule.delete as jest.Mock).mockResolvedValue({ id: 1 });

      const res = await request(server)
        .delete('/?id=1')
        .set('Authorization', 'Bearer valid-admin-token');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Vehicule deleted successfully');
    });

    it('should return 500 if Prisma throws on DELETE', async () => {
      (prisma.vehicule.delete as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(server)
        .delete('/?id=1')
        .set('Authorization', 'Bearer valid-admin-token');
      expect(res.status).toBe(500);
    });
  });

  // -------- PUT Tests --------
  describe('PUT /api/vehicule/[id]', () => {
    it('should return 400 for invalid name/type', async () => {
      const res = await request(server)
        .put('/?id=1')
        .set('Authorization', 'Bearer valid-admin-token')
        .send({ name: 123, type: [] });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Invalid name or type');
    });

    it('should update vehicule successfully', async () => {
      (prisma.vehicule.update as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'UpdatedCar',
        type: 'Truck',
      });

      const res = await request(server)
        .put('/?id=1')
        .set('Authorization', 'Bearer valid-admin-token')
        .send({ name: 'UpdatedCar', type: 'Truck' });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ id: 1, name: 'UpdatedCar', type: 'Truck' });
    });

    it('should return 500 if Prisma throws on PUT', async () => {
      (prisma.vehicule.update as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(server)
        .put('/?id=1')
        .set('Authorization', 'Bearer valid-admin-token')
        .send({ name: 'Test', type: 'SUV' });
      expect(res.status).toBe(500);
    });
  });
});