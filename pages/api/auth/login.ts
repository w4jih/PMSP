import { NextApiRequest, NextApiResponse } from 'next';

import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET!

const prisma =new PrismaClient()
export default async function loginhandler(
    req:NextApiRequest,
    res:NextApiResponse
) {
     if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');
     const { name, password } = req.body;

      try {
    // Search in Conducteurs
    const conducteur = await prisma.conducteur.findFirst({ where: { name } });

    // Search in Passagers if not found in Conducteurs
    const user = conducteur || await prisma.passager.findFirst({ where: { name } });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Compare plaintext passwords (you should use bcrypt in real projects)
    const isPasswordMatch = password === user.password;

    if (!isPasswordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, name: user.name }, JWT_SECRET, { expiresIn: '1h' });

    return res.status(200).json({ message: 'Login successful', token, role: conducteur ? 'conducteur' : 'passager' });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}