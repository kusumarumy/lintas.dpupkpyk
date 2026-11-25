
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE = 'lintas_session';

const ALLOWED_USERS = ['dpupkp1', 'dpupkp2'];

async function isValid(token?: string) {
  const secret = process.env.SESSION_SECRET;

  if (!token || !secret || secret.length < 32) {
    return false;
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );

    return (
      typeof payload.username === 'string' &&
      ALLOWED_USERS.includes(payload.username)
    );
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (
  path === '/' ||
  path === '/login' ||
  path === '/persebaran' ||
  path.startsWith('/persebaran/') ||
  path.startsWith('/api/auth/') ||
  path === '/api/geojson/jembatan' ||
  path.startsWith('/api/r2/')
) {
  return NextResponse.next();
}

  const valid = await isValid(
    request.cookies.get(COOKIE)?.value
  );

  if (valid) {
    return NextResponse.next();
  }

  if (path.startsWith('/api/')) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  const login = new URL('/login', request.url);

  login.searchParams.set(
    'redirect',
    path + request.nextUrl.search
  );

  return NextResponse.redirect(login);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
