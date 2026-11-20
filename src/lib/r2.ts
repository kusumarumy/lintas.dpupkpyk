export type GeoJSONFeatureCollection = {
  type: 'FeatureCollection';
  features: Array<{ type: 'Feature'; geometry: unknown; properties: Record<string, unknown> }>;
};

const baseUrl = process.env.NEXT_R2_BASE_URL?.replace(/\/$/, '');
export function r2Url(key: string) {
  if (!baseUrl) throw new Error('NEXT_R2_BASE_URL belum diatur.');
  return `${baseUrl}/${key.split('/').map(encodeURIComponent).join('/')}`;
}

export async function getGeoJSON(key: string): Promise<GeoJSONFeatureCollection> {
  const response = await fetch(r2Url(key), { cache: 'no-store' });
  if (!response.ok) throw new Error(`Gagal mengambil ${key}: HTTP ${response.status}`);
  return response.json() as Promise<GeoJSONFeatureCollection>;
}
