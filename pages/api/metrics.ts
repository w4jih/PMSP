import type { NextApiRequest, NextApiResponse } from 'next';
import { collectDefaultMetrics, register } from 'prom-client';
// collect once (Next API routes can hot-reload in dev, harmless in prod)
collectDefaultMetrics();

export const config = { api: { bodyParser: false } };

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', register.contentType);
  res.status(200).send(await register.metrics());
}