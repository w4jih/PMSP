import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { withAuthorization } from '../../../lib/withAuthorization';
 

const ORS_API_KEY = process.env.ORS_API_KEY!;
const handler=async (req: NextApiRequest, res: NextApiResponse)=> {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { fromLat, fromLng, toLat, toLng } = req.query;

  if (!fromLat || !fromLng || !toLat || !toLng) {
    return res.status(400).json({ error: 'Missing coordinates' });
  }

  try {
    const response = await axios.post(
      'https://api.openrouteservice.org/v2/directions/driving-car',
      {
        coordinates: [
          [parseFloat(fromLng as string), parseFloat(fromLat as string)],
          [parseFloat(toLng as string), parseFloat(toLat as string)],
        ],
      },
      {
        headers: {
          Authorization: ORS_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    const route = response.data.routes[0].summary;
    return res.status(200).json({
      distanceKm: route.distance / 1000,
      durationMin: route.duration / 60,
    });
  } catch (err) {
    console.error('OpenRouteService error:', err);
    return res.status(500).json({ error: 'Failed to fetch route data' });
  }
}
export default withAuthorization(['admin','conducteur','passager'],handler);