// pages/api/employers.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const employers = await prisma.employer.findMany();
    return res.status(200).json(employers);
  }

  if (req.method === 'POST') {
    const { name, company } = req.body;
    if (!name || !company) {
      return res.status(400).json({ error: 'Missing name or company' });
    }

    const newEmployer = await prisma.employer.create({
      data: { name, company },
    });

    return res.status(201).json(newEmployer);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
