import request from 'supertest';
import { createTestServer } from './testserver';
import handler from '../pages/api/vehicule_post'; // adjust path as needed
import { prisma } from './__mocks__/prisma';

describe('POST /api/vehicule_post', () => {
  let server: any;

  beforeAll(() => {
    server = createTestServer(handler);
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
    jest.resetAllMocks();
  });

  it('should return 400 when required fields are missing', async () => {
    const res = await request(server).post('/').send({ name: 'Car' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Missing name, type or conducteurId');
  });

  it('should create a vehicule successfully', async () => {
    (prisma.vehicule.create as jest.Mock).mockResolvedValue({
      id: 1,
      name: 'Toyota',
      type: 'SUV',
      conducteurId: 5,
    });

    const res = await request(server)
      .post('/')
      .send({ name: 'Toyota', type: 'SUV', conducteurId: 5 });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message', 'vehicule created successfuly');
    expect(prisma.vehicule.create).toHaveBeenCalledWith({
      data: { name: 'Toyota', type: 'SUV', conducteurId: 5 },
    });
  });

  it('should return 500 when prisma.vehicule.create throws an error', async () => {
    (prisma.vehicule.create as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(server)
      .post('/')
      .send({ name: 'BMW', type: 'Sedan', conducteurId: 2 });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('err');
  });
});