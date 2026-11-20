import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE = 'lintas_session';
async function isValid(token?: string) {
  const secret = process.env.SESSION_SECRET;
  if (!token || !secret || secret.length < 32) return false;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return typeof payload.username === 'string';
  } catch { return false; }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path === '/login' || path.startsWith('/api/auth/')) return NextResponse.next();
  const valid = await isValid(request.cookies.get(COOKIE)?.value);
  if (valid) return NextResponse.next();
  if (path.startsWith('/api/')) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const login = new URL('/login', request.url);
  login.searchParams.set('redirect', path + request.nextUrl.search);
  return NextResponse.redirect(login);
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
