export const prisma = {
  conducteur: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  },
  passager: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  },
   vehicule: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  },
  admin: {
    findFirst: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
  },
  reservation: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique:jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  },
  trajectory: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
   paymentIntent: {
    create: jest.fn(),
  },
   $disconnect: jest.fn(),
  
};
