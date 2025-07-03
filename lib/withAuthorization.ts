// lib/withAuthorization.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from './auth';

type Handler = (req: NextApiRequest, res: NextApiResponse, user: any) => void | Promise<void>;

export function withAuthorization(allowedRoles: string[], handler: Handler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const user = verifyToken(req);

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ error: 'Access denied: insufficient role' });
      }

      return handler(req, res, user);
    } catch (err) {
      return res.status(401).json({ error: 'Unauthorized: invalid or missing token' });
    }
  };
}
