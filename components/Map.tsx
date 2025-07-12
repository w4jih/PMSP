'use client'; // if using app/ directory, safe to include anyway

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function Map() {
  const [routeInfo, setRouteInfo] = useState<{ distanceKm: number; durationMin: number } | null>(null);

  useEffect(() => {
  const fetchRoute = async () => {
    try {
      const res = await fetch('/api/routing/route?fromLat=36.8065&fromLng=10.1815&toLat=35.8256&toLng=10.6406');
      
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API error: ${res.status} - ${text}`);
      }

      const data = await res.json();
      console.log('✅ Route info:', data);
      setRouteInfo(data);
    } catch (err) {
      console.error('❌ Failed to load route:', err);
    }
  };

  fetchRoute(); // ⬅️ ACTUALLY CALL the function
}, []); // ⬅️ Add dependency array so it runs once

  return (
    <>
      <MapContainer center={[36.8065, 10.1815]} zoom={8} style={{ height: '500px', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <Marker position={[36.8065, 10.1815]}>
          <Popup>Start: Tunis</Popup>
        </Marker>
        <Marker position={[35.8256, 10.6406]}>
          <Popup>End: Sousse</Popup>
        </Marker>
      </MapContainer>

      {routeInfo && (
        <div style={{ marginTop: '1rem' }}>
          <p><strong>Distance:</strong> {routeInfo.distanceKm.toFixed(2)} km</p>
          <p><strong>Duration:</strong> {routeInfo.durationMin.toFixed(1)} minutes</p>
        </div>
      )}
    </>
  );
}
