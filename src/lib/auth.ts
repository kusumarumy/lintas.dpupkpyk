
import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'lintas_session';
const SESSION_SECONDS = 60 * 60 * 8;

type AuthUser = {
  username: string;
  passwordHash: string;
};

type SessionPayload = {
  username: string;
};

function secretKey() {
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET harus diisi minimal 32 karakter.');
  }

  return new TextEncoder().encode(secret);
}

function getUsers(): AuthUser[] {
  const users: AuthUser[] = [
    {
      username: 'dpupkp1',
      passwordHash: Buffer.from(
        process.env.DPUPKP1_PASSWORD_HASH_B64 ?? '',
        'base64'
      ).toString('utf8'),
    },
    {
      username: 'dpupkp2',
      passwordHash: Buffer.from(
        process.env.DPUPKP2_PASSWORD_HASH_B64 ?? '',
        'base64'
      ).toString('utf8'),
    },
  ];

  if (
    users.some(
      (user) =>
        user.passwordHash.length !== 60 ||
        !/^\$2[aby]\$\d{2}\$/.test(user.passwordHash)
    )
  ) {
    throw new Error('Password hash akun belum dikonfigurasi dengan benar.');
  }

  return users;
}

export async function verifyCredentials(
  username: string,
  password: string
) {
  const normalizedUsername = username.trim().toLowerCase();

  const user = getUsers().find(
    (entry) => entry.username === normalizedUsername
  );

  if (!user) return false;

  return bcrypt.compare(password, user.passwordHash);
}

export async function createSession(username: string) {
  const token = await new SignJWT({
    username: username.trim().toLowerCase(),
  } satisfies SessionPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_SECONDS}s`)
    .sign(secretKey());

  const jar = await cookies();

  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_SECONDS,
  });
}

export async function destroySession() {
  const jar = await cookies();

  jar.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export async function readSession(
  token?: string
): Promise<SessionPayload | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey());

    if (
      typeof payload.username !== 'string' ||
      !['dpupkp1', 'dpupkp2'].includes(payload.username)
    ) {
      return null;
    }

    return {
      username: payload.username,
    };
  } catch {
    return null;
  }
}

export const sessionCookieName = COOKIE_NAME;
