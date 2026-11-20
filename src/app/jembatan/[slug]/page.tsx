import Header from '@/components/Header';
import { notFound } from 'next/navigation';

const names: Record<string, string> = {
  'jembatan-kewek': 'Jembatan Kewek',
  'jembatan-kleringan': 'Jembatan Kleringan (Amarta)',
  'jembatan-mujamuju-selatan': 'Jembatan Muja Muju Selatan',
  'jembatan-mujamuju-utara': 'Jembatan Muja Muju Utara',
  'jembatan-winong-selatan': 'Jembatan Winong Selatan',
  'jembatan-winong-utara': 'Jembatan Winong Utara',
};

export function generateStaticParams() {
  return Object.keys(names).map((slug) => ({ slug }));
}

export default async function BridgeDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const name = names[slug];
  if (!name) notFound();

  return <>
    <Header />
    <main className="legacy-frame-page">
      <iframe
        title={`Visualisasi dan informasi ${name}`}
        src={`/legacy/${slug}`}
        className="legacy-bridge-frame"
        allow="fullscreen; geolocation"
        loading="eager"
      />
    </main>
  </>;
}
