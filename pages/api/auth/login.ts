import { NextApiRequest, NextApiResponse } from 'next';

import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
const JWT_SECRET = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return process.env.JWT_SECRET;
};

const prisma =new PrismaClient()
export default async function loginhandler(
    req:NextApiRequest,
    res:NextApiResponse
) {
     if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');
     const { name, password } = req.body;

       

  try {
    // Try to find user in Admin
    const admin = await prisma.admin.findFirst({ where: { name } });
    if (admin && bcrypt.compareSync(password, admin.password)) {
      const token = jwt.sign({ id: admin.id, name: admin.name,role:"admin" }, JWT_SECRET(), {
        expiresIn: '1h',
      });
      return res
        .status(200)
        .json({ message: 'Login successful', token, role: 'admin' });
    }

    // Try to find user in Conducteur
    const conducteur = await prisma.conducteur.findFirst({ where: { name } });
    if (conducteur && bcrypt.compareSync(password, conducteur.password)) {
      const token = jwt.sign(
        { id: conducteur.id, name: conducteur.name,role:"conducteur" },
        JWT_SECRET(),
        { expiresIn: '1h' }
      );
      return res
        .status(200)
        .json({ message: 'Login successful', token, role: 'conducteur' });
    }

    // Try to find user in Passager
    const passager = await prisma.passager.findFirst({ where: { name } });
    if (passager && bcrypt.compareSync( password,passager.password)) {
      const token = jwt.sign(
        { id: passager.id, name: passager.name ,role:"passager"},
        JWT_SECRET(),
        { expiresIn: '1h' }
      );
      return res
        .status(200)
        .json({ message: 'Login successful', token, role: 'passager' });
    }

    // If none matched
    return res.status(401).json({ error: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Something went wrong' });
  } finally {
    await prisma.$disconnect();
  }
}