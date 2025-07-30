import { withAuthorization } from "../../../lib/withAuthorization";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextApiRequest, NextApiResponse } from "next";



import prisma from "../../../lib/prisma"; 

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = parseInt(req.query.id as string);

 if (req.method === 'GET') {
  try {
    const conducteurs = await prisma.conducteur.findMany({ where: { id } });
    return res.status(200).json(conducteurs);
  } catch (error) {
    return res.status(500).json({ error: 'server error' });
  }
}

  if (req.method === 'DELETE') {
    if (!id) return res.status(400).json({ error: 'Missing ID' });

    try {
      await prisma.conducteur.delete({ where: { id } });
      return res.status(200).json({ message: `Conducteur with ID ${id} deleted` });
    } catch (error) {
      return res.status(500).json({ error: 'Error deleting conducteur' });
    }
  }

  if (req.method === 'PUT') {
    const { name, lastname, Cin, email, password } = req.body;

    try {
      const hashedPassword = bcrypt.hashSync(password, 10);
      await prisma.conducteur.update({
        where: { id },
        data: { name, lastname, Cin, email, password: hashedPassword },
      });
      return res.status(200).json({ message: `Conducteur with ID ${id} updated` });
    } catch (error) {
      return res.status(500).json({ error: 'Error updating conducteur' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
// 👇 Only allow admin or conducteur to access
export default withAuthorization(['admin', 'conducteur'], handler);