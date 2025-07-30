import { createServer } from 'http';
import { parse } from 'url';
import { NextApiRequest, NextApiResponse } from 'next';
/*
export function createTestServer(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void | NextApiResponse<any>>
) {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        (req as any).body = body ? JSON.parse(body) : {};
      } catch {
        (req as any).body = {};
      }

      await handler(
        Object.assign(req, { query: parsedUrl.query }) as NextApiRequest,
        Object.assign(res, {
          status: (code: number) => {
            res.statusCode = code;
            return res;
          },
          json: (data: any) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          },
        }) as NextApiResponse
      );
    });
  });

  return server.listen();
}*/





export function createTestServer(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void | NextApiResponse> | void) {
  const server = createServer((req, res) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      (req as any).body = body ? JSON.parse(body) : {};
      const parsedUrl = parse(req.url!, true);
      (req as any).query = parsedUrl.query;

      const enhancedRes = Object.assign(res, {
        status: (code: number) => {
          res.statusCode = code;
          return enhancedRes;
        },
        json: (data: any) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));  // Ensure res.end() is called
        },
      }) as NextApiResponse;

      await handler(req as NextApiRequest, enhancedRes);
    });
  });
  return server.listen();  // Ensure server is listening
}
