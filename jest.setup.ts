jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => require('./test/__mocks__/prisma').prisma),
}));
