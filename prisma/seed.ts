// prisma/seed.ts

import {PrismaClient}  from '@prisma/client';

import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const exists = await prisma.admin.findFirst({ where: { name: 'admin' } });

  if (!exists) {
    await prisma.admin.create({
      data: {
        name: 'admin',
        password: bcrypt.hashSync('admin123', 10),
        
      },
    });
    console.log('✅ Admin created');
  } else {
    console.log('ℹ️ Admin already exists');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
