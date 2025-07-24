import request from 'supertest';
import { createTestServer } from './testserver';
import passagersPostHandler from '../pages/api/passagers_post';
import { prisma } from './__mocks__/prisma';

describe('POST /api/passagers_post', () => {
  let server: any;

  beforeAll(() => {
    server = createTestServer(passagersPostHandler);
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
    jest.resetAllMocks();
  });

  it('should return 400 when fields are missing', async () => {
    const res = await request(server).post('/').send({ name: 'John' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should create a passager successfully', async () => {
    (prisma.passager.create as jest.Mock).mockResolvedValue({
      id: 1,
      name: 'John',
      lastname: 'Doe',
      Cin: '12345',
      email: 'john@example.com',
      password: 'hashedpassword',
    });

    const res = await request(server).post('/').send({
      name: 'John',
      lastname: 'Doe',
      Cin: '12345',
      email: 'john@example.com',
      password: '123456',
    });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('conducteur created seccessfully'); // This matches your original message
    expect(prisma.passager.create).toHaveBeenCalled();
  });
});