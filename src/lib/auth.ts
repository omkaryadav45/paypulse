import { cookies } from "next/headers";
import type { Role } from "@/lib/constants";
import {
  SESSION_COOKIE,
  signSession,
  verifySession,
  type Session,
} from "@/lib/session";

/** Read and verify the current session from the cookie. */
export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

/** Sign in: persist the session as a signed, httpOnly cookie. */
export async function createSession(session: Session) {
  const token = await signSession(session);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Least-privilege default: ANALYST when unauthenticated. */
export async function getCurrentRole(): Promise<Role> {
  const session = await getSession();
  return session?.role ?? "ANALYST";
}

export async function requireRole(
  role: Role,
): Promise<{ ok: boolean; role: Role }> {
  const current = await getCurrentRole();
  return { ok: current === role, role: current };
}

export async function isAdmin(): Promise<boolean> {
  return (await getCurrentRole()) === "ADMIN";
}
