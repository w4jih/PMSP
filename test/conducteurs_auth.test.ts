jest.mock('../lib/withAuthorization', () => {
  return {
    withAuthorization: (roles: string[], handler: any) => {
      // Return a fake handler that verifies Authorization header
      return (req: any, res: any) => {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({ error: 'Unauthorized' });
        }
        const token = authHeader.replace('Bearer ', '');
        if (token !== 'valid-admin-token' && token !== 'valid-conducteur-token') {
          return res.status(403).json({ error: 'Forbidden' });
        }
        return handler(req, res); // Call the real handler
      };
    },
  };
});

import request from 'supertest';
import { createTestServer } from './testserver';
import handler from '../pages/api/conducteurs'; // adjust the path
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

describe('GET /api/conducteurs (with JWT auth)', () => {
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

  it('should return conducteurs for valid admin token', async () => {
    (prisma.conducteur.findMany as jest.Mock).mockResolvedValue([
      { id: 1, name: 'John', lastname: 'Doe', Cin: '12345', email: 'john@example.com' },
    ]);

    const res = await request(server)
      .get('/')
      .set('Authorization', 'Bearer valid-admin-token');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { id: 1, name: 'John', lastname: 'Doe', Cin: '12345', email: 'john@example.com' },
    ]);
  });
});

describe('POST /api/conducteurs_auth (with JWT auth)', () => {
  let server: any;

  beforeAll(() => {
    server = createTestServer(handler);
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
    jest.resetAllMocks();
  });

  it('should return 400 when fields are missing', async () => {
    const res = await request(server)
      .post('/')
      .set('Authorization', 'Bearer valid-admin-token')
      .send({ name: 'John' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should create a conducteur successfully', async () => {
    (prisma.conducteur.create as jest.Mock).mockResolvedValue({
      id: 1,
      name: 'John',
      lastname: 'Doe',
      Cin: '12345',
      email: 'john@example.com',
      password: 'hashedpass',
    });

    const res = await request(server)
      .post('/')
      .set('Authorization', 'Bearer valid-admin-token')
      .send({
        name: 'John',
        lastname: 'Doe',
        Cin: '12345',
        email: 'john@example.com',
        password: '123456',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message', 'conducteur created seccessfully');
    expect(prisma.conducteur.create).toHaveBeenCalled();
  });
});