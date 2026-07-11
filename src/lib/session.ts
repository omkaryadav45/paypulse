import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@/lib/constants";

export const SESSION_COOKIE = "pp_session";

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ??
    "paypulse-dev-secret-change-me-in-production-0123456789abcdef",
);

export type Session = {
  userId: string;
  name: string;
  email: string;
  role: Role;
};

/** Sign a session into a JWT (Edge-compatible via jose). */
export async function signSession(session: Session): Promise<string> {
  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

/** Verify a JWT and return the session, or null if invalid/expired. */
export async function verifySession(
  token: string | undefined,
): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      userId: String(payload.userId),
      name: String(payload.name),
      email: String(payload.email),
      role: payload.role as Role,
    };
  } catch {
    return null;
  }
}
