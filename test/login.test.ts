import request from 'supertest';
import { createTestServer } from './testserver';
import loginhandler from '../pages/api/auth/login'; // adjust path as needed
import { prisma } from './__mocks__/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('POST /api/auth/login', () => {
  let server: any;
  const JWT_SECRET = 'testsecret';

  beforeAll(() => {
    process.env.JWT_SECRET = JWT_SECRET;
    server = createTestServer(loginhandler);
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
    jest.resetAllMocks();
  });

  it('should return 405 for non-POST requests', async () => {
    const res = await request(server).get('/');
    expect(res.status).toBe(405);
  });

  it('should login admin successfully', async () => {
    (prisma.admin.findFirst as jest.Mock).mockResolvedValue({
      id: 1,
      name: 'adminUser',
      password: bcrypt.hashSync('admin123', 10),
    });

    const res = await request(server)
      .post('/')
      .send({ name: 'adminUser', password: 'admin123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    const decoded = jwt.verify(res.body.token, JWT_SECRET) as any;
    expect(decoded.role).toBe('admin');
  });

  it('should login conducteur successfully', async () => {
    (prisma.admin.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.conducteur.findFirst as jest.Mock).mockResolvedValue({
      id: 2,
      name: 'conductUser',
      password: bcrypt.hashSync('conduct123', 10),
    });

    const res = await request(server)
      .post('/')
      .send({ name: 'conductUser', password: 'conduct123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    const decoded = jwt.verify(res.body.token, JWT_SECRET) as any;
    expect(decoded.role).toBe('conducteur');
  });

  it('should login passager successfully', async () => {
    (prisma.admin.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.conducteur.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.passager.findFirst as jest.Mock).mockResolvedValue({
      id: 3,
      name: 'passUser',
      password: bcrypt.hashSync('pass123', 10),
    });

    const res = await request(server)
      .post('/')
      .send({ name: 'passUser', password: 'pass123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    const decoded = jwt.verify(res.body.token, JWT_SECRET) as any;
    expect(decoded.role).toBe('passager');
  });

  it('should return 401 for invalid credentials', async () => {
    (prisma.admin.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.conducteur.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.passager.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(server)
      .post('/')
      .send({ name: 'wrongUser', password: 'wrongPass' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Invalid credentials');
  });

  it('should return 500 on Prisma error', async () => {
    (prisma.admin.findFirst as jest.Mock).mockRejectedValue(new Error('DB Error'));

    const res = await request(server)
      .post('/')
      .send({ name: 'adminUser', password: 'admin123' });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Something went wrong');
  });
});
