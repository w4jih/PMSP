import request from 'supertest';
import { createTestServer } from './testserver';
import conducteursPostHandle from '../pages/api/conducteurs_post';
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

describe('POST /api/conducteurs_post', () => {
  let server: any;

  beforeAll(() => {
    server = createTestServer(conducteursPostHandle);
  });

  afterAll((done) => {
    server.close(done);
  });

  it('should return 400 when fields are missing', async () => {
    const res = await request(server)
      .post('/')
      .send({ name: 'John' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should create a conducteur successfully', async () => {
    (prisma.conducteur.create as jest.Mock).mockResolvedValue({
      
      name: 'John',
      lastname: 'Doe',
      Cin: '12345',
      email: 'john@example.com',
      password: 'hashed',
    });

    const res = await request(server)
      .post('/')
      .send({
        name: 'John',
        lastname: 'Doe',
        Cin: '12345',
        email: 'john@example.com',
        password: '123456',
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('conducteur created seccessfully');
    expect(prisma.conducteur.create).toHaveBeenCalled();
  });
});
