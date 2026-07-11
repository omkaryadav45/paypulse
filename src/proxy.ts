import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

/**
 * Route protection (Next.js 16 "proxy" convention, formerly middleware).
 * Verifies the signed JWT session and gates access to the app.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isLogin = pathname === "/login";
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);

  // Unauthenticated users can only see the login page.
  if (!session && !isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Authenticated users skip the login page.
  if (session && isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)"],
};
