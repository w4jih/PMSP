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
import handler from '../pages/api/admin'; // Adjust path to your file
jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
    admin: {
    findFirst: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
  },
  },
}));
import prisma from '../lib/prisma';

describe('POST /api/updatePrice (with JWT auth)', () => {
  let server: any;

  beforeAll(() => {
    server = createTestServer(handler);
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
    jest.resetAllMocks();
  });

  it('should return 405 if method is not POST', async () => {
    const res = await request(server)
      .get('/')
      .set('Authorization', 'Bearer valid-admin-token');

    expect(res.status).toBe(405);
    expect(res.body).toHaveProperty('error', 'method not allowed');
  });

  it('should return 401 when no Authorization header is provided', async () => {
    const res = await request(server).post('/');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Unauthorized');
  });

  it('should return 403 when an invalid token is provided', async () => {
    const res = await request(server)
      .post('/')
      .set('Authorization', 'Bearer invalid-token')
      .send({ kmprice: 5, id: 1 });

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error', 'Forbidden');
  });

  it('should update price successfully', async () => {
    (prisma.admin.update as jest.Mock).mockResolvedValue({
      id: 1,
      kmprice: 5,
    });

    const res = await request(server)
      .post('/')
      .set('Authorization', 'Bearer valid-admin-token')
      .send({ kmprice: 5, id: 1 });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('messsage', 'Price updated successfully');
    expect(res.body.updatedprice).toBe(5);
    expect(prisma.admin.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { kmprice: 5 },
    });
  });

  it('should return 500 if Prisma throws an error', async () => {
    (prisma.admin.update as jest.Mock).mockRejectedValue(new Error('DB Error'));

    const res = await request(server)
      .post('/')
      .set('Authorization', 'Bearer valid-admin-token')
      .send({ kmprice: 10, id: 1 });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'server error');
  });
});