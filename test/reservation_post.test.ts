// Mock verifyToken to return a fake user
jest.mock('../lib/auth', () => ({
  verifyToken: jest.fn().mockReturnValue({ id: 123 }), // Mock user with id=123
}));
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
// Update the import path below to the correct relative path for your project structure
import handler from '../pages/api/reservations_post'; // Adjust the path if needed
jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
   reservation: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique:jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  },
  vehicule: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
    trajectory: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },

  },
}));
import prisma from '../lib/prisma';

describe('POST /api/reservation (with JWT auth)', () => {
  let server: any;

  beforeAll(() => {
    server = createTestServer(handler);
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
    jest.resetAllMocks();
  });

  it('should return 401 when Authorization header is missing', async () => {
    const res = await request(server).post('/');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Unauthorized');
  });

  it('should return 400 if vehicle is not available', async () => {
    (prisma.vehicule.findUnique as jest.Mock).mockResolvedValue({ id: 1, available: false });

    const res = await request(server)
      .post('/')
      .set('Authorization', 'Bearer valid-admin-token')
      .send({
        vehicleId: 1,
        startTime: '2025-07-23T10:00:00Z',
        endTime: '2025-07-23T11:00:00Z',
        source: 'A',
        destination: 'B',
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Vehicle not available');
  });

  it('should return 409 if there is an overlapping reservation', async () => {
    (prisma.vehicule.findUnique as jest.Mock).mockResolvedValue({ id: 1, available: true });
    (prisma.reservation.findFirst as jest.Mock).mockResolvedValue({ id: 999 });

    const res = await request(server)
      .post('/')
      .set('Authorization', 'Bearer valid-admin-token')
      .send({
        vehicleId: 1,
        startTime: '2025-07-23T10:00:00Z',
        endTime: '2025-07-23T11:00:00Z',
        source: 'A',
        destination: 'B',
      });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error', 'Vehicle already reserved in this time window');
  });

  it('should create a reservation successfully', async () => {
    (prisma.vehicule.findUnique as jest.Mock).mockResolvedValue({ id: 1, available: true });
    (prisma.reservation.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.trajectory.findFirst as jest.Mock).mockResolvedValue({ id: 42 });
    (prisma.reservation.create as jest.Mock).mockResolvedValue({
      id: 1234,
      userId: 123,
      vehicleId: 1,
    });

    const res = await request(server)
      .post('/')
      .set('Authorization', 'Bearer valid-admin-token')
      .send({
        vehicleId: 1,
        startTime: '2025-07-23T10:00:00Z',
        endTime: '2025-07-23T11:00:00Z',
        source: 'A',
        destination: 'B',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message', 'reservation created successfuly');
    expect(prisma.reservation.create).toHaveBeenCalled();
  });

  it('should create a trajectory if it does not exist', async () => {
    (prisma.vehicule.findUnique as jest.Mock).mockResolvedValue({ id: 1, available: true });
    (prisma.reservation.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.trajectory.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.trajectory.create as jest.Mock).mockResolvedValue({ id: 99 });
    (prisma.reservation.create as jest.Mock).mockResolvedValue({ id: 5678 });

    const res = await request(server)
      .post('/')
      .set('Authorization', 'Bearer valid-admin-token')
      .send({
        vehicleId: 1,
        startTime: '2025-07-23T10:00:00Z',
        endTime: '2025-07-23T11:00:00Z',
        source: 'C',
        destination: 'D',
      });

    expect(res.status).toBe(201);
    expect(prisma.trajectory.create).toHaveBeenCalledWith({
      data: { source: 'C', destination: 'D' },
    });
  });
});