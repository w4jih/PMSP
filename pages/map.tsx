// pages/map.tsx
import dynamic from 'next/dynamic';
import Head from 'next/head';

const Map = dynamic(() => import('../components/Map'), { ssr: false });

export default function MapPage() {
  return (
    <>
      <Head>
        <title>OpenStreetMap with Leaflet</title>
      </Head>
      <main style={{ padding: '20px' }}>
        <h1>Map Example</h1>
        <Map /> {/* fetch happens here */}
      </main>
    </>
  );
}
