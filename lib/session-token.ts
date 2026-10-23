import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "session";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type SessionPayload = {
  userId: string;
  role: "SUPER_ADMIN";
  exp: number;
};

function sessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set to at least 32 characters.");
  }
  return secret;
}

function sign(body: string) {
  return createHmac("sha256", sessionSecret()).update(body).digest("base64url");
}

function signaturesMatch(actual: string, expected: string) {
  const left = Buffer.from(actual);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function encryptSession(userId: string) {
  const payload: SessionPayload = {
    userId,
    role: "SUPER_ADMIN",
    exp: Date.now() + SESSION_TTL_MS,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export async function decryptSession(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;

  const [body, signature] = token.split(".");
  if (!body || !signature || token.split(".").length !== 2) return null;
  if (!signaturesMatch(signature, sign(body))) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as Partial<SessionPayload>;
    if (
      typeof payload.userId !== "string" ||
      payload.userId.length === 0 ||
      payload.role !== "SUPER_ADMIN" ||
      typeof payload.exp !== "number" ||
      payload.exp <= Date.now()
    ) {
      return null;
    }
    return { userId: payload.userId, role: "SUPER_ADMIN", exp: payload.exp };
  } catch {
    return null;
  }
}

export function sessionExpiry() {
  return new Date(Date.now() + SESSION_TTL_MS);
}
