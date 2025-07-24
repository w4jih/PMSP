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

// Mock Prisma Client
import { prisma } from './__mocks__/prisma';

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        id: 'pi_test_123',
        client_secret: 'cs_test_secret',
        status: 'succeeded',
      }),
    },
  }));
});

import request from 'supertest';
import { createTestServer } from './testserver';
import handler from '../pages/api/payments/intents';

describe('POST /api/payment/intent (with JWT auth)', () => {
  let server: any;

  beforeAll(() => {
    server = createTestServer(handler);
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
    jest.resetAllMocks();
  });

  it('should return 401 if Authorization header is missing', async () => {
    const res = await request(server).post('/');
    expect(res.status).toBe(401);
  });

  it('should return 405 if method is not POST', async () => {
    const res = await request(server)
      .get('/')
      .set('Authorization', 'Bearer valid-passager-token');
    expect(res.status).toBe(405);
    expect(res.body).toHaveProperty('error', 'method not allowed');
  });

  it('should return 400 if distance is missing or invalid', async () => {
    const res = await request(server)
      .post('/')
      .set('Authorization', 'Bearer valid-passager-token')
      .send({ reservationid: 1 });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Invalid Input');
  });

  it('should return 400 if reservationid is missing', async () => {
    const res = await request(server)
      .post('/')
      .set('Authorization', 'Bearer valid-passager-token')
      .send({ distance: 10 });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Invalid Input');
  });

  it('should return 500 if admin or kmprice is missing', async () => {
    (prisma.admin.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(server)
      .post('/')
      .set('Authorization', 'Bearer valid-passager-token')
      .send({ distance: 10, reservationid: 1 });
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Admin or kmprice not found');
  });

  it('should return 500 if reservation does not exist', async () => {
    (prisma.admin.findUnique as jest.Mock).mockResolvedValue({ id: 1, kmprice: 2 });
    (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(server)
      .post('/')
      .set('Authorization', 'Bearer valid-passager-token')
      .send({ distance: 10, reservationid: 99 });
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Internal server error');
  });

  it('should create payment intent and return client_secret', async () => {
    (prisma.admin.findUnique as jest.Mock).mockResolvedValue({ id: 1, kmprice: 2 });
    (prisma.reservation.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
    (prisma.reservation.update as jest.Mock).mockResolvedValue({ id: 1, status: 'paid' });
    (prisma.paymentIntent.create as jest.Mock).mockResolvedValue({ id: 1 });

    const res = await request(server)
      .post('/')
      .set('Authorization', 'Bearer valid-passager-token')
      .send({ distance: 10, reservationid: 1 });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('clientsecret', 'cs_test_secret');
    expect(prisma.reservation.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: 'paid' },
    });
    expect(prisma.paymentIntent.create).toHaveBeenCalled();
  });
});
