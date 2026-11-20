import { NextRequest, NextResponse } from 'next/server';
import { createSession, verifyCredentials } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { username?: string; password?: string; redirect?: string };
    const username = body.username?.trim() ?? '';
    const password = body.password ?? '';
    if (!username || !password || username.length > 100 || password.length > 200) {
      return NextResponse.json({ message: 'Username dan password wajib diisi.' }, { status: 400 });
    }
    if (!(await verifyCredentials(username, password))) {
      return NextResponse.json({ message: 'Username atau password tidak sesuai.' }, { status: 401 });
    }
    await createSession(username);
    const target = body.redirect && body.redirect.startsWith('/') && !body.redirect.startsWith('//') ? body.redirect : '/';
    return NextResponse.json({ ok: true, redirect: target });
  } catch (error) {
    console.error('Login configuration error:', error);
    return NextResponse.json({ message: 'Layanan autentikasi belum dikonfigurasi dengan benar.' }, { status: 500 });
  }
}
