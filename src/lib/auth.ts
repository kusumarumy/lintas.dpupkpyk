import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'lintas_session';
const SESSION_SECONDS = 60 * 60 * 8;

type AuthUser = { username: string; passwordHash: string };
type SessionPayload = { username: string };

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error('SESSION_SECRET harus diisi minimal 32 karakter.');
  return new TextEncoder().encode(secret);
}

function getUsers(): AuthUser[] {
  const raw = process.env.AUTH_USERS_JSON;
  if (!raw) throw new Error('AUTH_USERS_JSON belum dikonfigurasi.');
  const users: unknown = JSON.parse(raw);
  if (!Array.isArray(users) || users.length !== 2) throw new Error('AUTH_USERS_JSON harus berisi tepat dua akun.');
  return users as AuthUser[];
}

export async function verifyCredentials(username: string, password: string) {
  const user = getUsers().find((entry) => entry.username === username);
  if (!user || !user.passwordHash || user.passwordHash.includes('REPLACE_WITH')) return false;
  return bcrypt.compare(password, user.passwordHash);
}

export async function createSession(username: string) {
  const token = await new SignJWT({ username } satisfies SessionPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_SECONDS}s`)
    .sign(secretKey());
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', path: '/', maxAge: SESSION_SECONDS,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.set(COOKIE_NAME, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 });
}

export async function readSession(token?: string): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (typeof payload.username !== 'string') return null;
    return { username: payload.username };
  } catch { return null; }
}

export const sessionCookieName = COOKIE_NAME;
