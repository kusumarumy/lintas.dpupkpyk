import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';

const allowed = new Set([
  'jembatan-kewek',
  'jembatan-kleringan',
  'jembatan-mujamuju-selatan',
  'jembatan-mujamuju-utara',
  'jembatan-winong-selatan',
  'jembatan-winong-utara',
]);

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  if (!allowed.has(slug)) return new NextResponse('Not Found', { status: 404 });
  const file = path.join(process.cwd(), 'public', 'legacy', `${slug}.html`);
  try {
    const source = await readFile(file, 'utf8');
    const token = process.env.CESIUM_ION_TOKEN;
    if (!token) {
      return new NextResponse('Konfigurasi CESIUM_ION_TOKEN belum diisi.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }
    const html = source.replaceAll('__CESIUM_ION_TOKEN__', token.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!));
    return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store' } });
  } catch {
    return new NextResponse('Halaman jembatan tidak ditemukan.', { status: 404 });
  }
}
