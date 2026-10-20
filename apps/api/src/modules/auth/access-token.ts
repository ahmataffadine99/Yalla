import { createHmac, timingSafeEqual } from 'node:crypto';

export const ACCESS_TOKEN_TTL_SECONDS = 60 * 60;

export type AuthenticatedUser = {
  id: string;
  email: string;
};

type AccessTokenPayload = AuthenticatedUser & {
  exp: number;
  iat: number;
};

export function createAccessToken(
  user: AuthenticatedUser,
  secret: string,
  now = Math.floor(Date.now() / 1000),
): string {
  const payload: AccessTokenPayload = {
    ...user,
    iat: now,
    exp: now + ACCESS_TOKEN_TTL_SECONDS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    'base64url',
  );
  const signature = sign(encodedPayload, secret);
  return `${encodedPayload}.${signature}`;
}

export function verifyAccessToken(
  token: string,
  secret: string,
  now = Math.floor(Date.now() / 1000),
): AuthenticatedUser | null {
  const [encodedPayload, suppliedSignature, extra] = token.split('.');
  if (!encodedPayload || !suppliedSignature || extra !== undefined) {
    return null;
  }

  const expectedSignature = sign(encodedPayload, secret);
  const expected = Buffer.from(expectedSignature);
  const supplied = Buffer.from(suppliedSignature);
  if (
    expected.length !== supplied.length ||
    !timingSafeEqual(expected, supplied)
  ) {
    return null;
  }

  let payload: unknown;
  try {
    payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8'),
    );
  } catch {
    return null;
  }

  if (
    !isRecord(payload) ||
    typeof payload.id !== 'string' ||
    typeof payload.email !== 'string' ||
    typeof payload.exp !== 'number' ||
    payload.exp <= now
  ) {
    return null;
  }

  return { id: payload.id, email: payload.email };
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret)
    .update(payload)
    .digest('base64url');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
