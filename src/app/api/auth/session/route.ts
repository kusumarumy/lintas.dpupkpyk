
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { readSession, sessionCookieName } from '@/lib/auth';

export async function GET() {
  const jar = await cookies();
  const token = jar.get(sessionCookieName)?.value;
  const session = await readSession(token);

  return NextResponse.json(
    {
      authenticated: Boolean(session),
      username: session?.username ?? null,
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}
