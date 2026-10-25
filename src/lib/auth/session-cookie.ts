import { cookies } from "next/headers";
import {
  SESSION_ALIVE_COOKIE,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/auth-constants";
import { signSessionToken } from "@/lib/auth/session-token";
import type { AuthenticatedUser, AuthSessionResult } from "@/types/auth";

/**
 * Emite las cookies de sesión sin Max-Age/Expires para que expiren al cerrar el navegador.
 */
export async function issueSessionCookies(user: AuthenticatedUser): Promise<AuthSessionResult> {
  const issuedAt = Date.now();
  const sessionToken = await signSessionToken(user, issuedAt);
  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === "production";

  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure,
  });
  cookieStore.set(SESSION_ALIVE_COOKIE, "1", {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    secure,
  });

  return { user, sessionToken, issuedAt };
}

/**
 * Elimina las cookies de sesión del usuario.
 */
export async function clearSessionCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete(SESSION_ALIVE_COOKIE);
  cookieStore.set(SESSION_COOKIE_NAME, "", { maxAge: 0, path: "/" });
  cookieStore.set(SESSION_ALIVE_COOKIE, "", { maxAge: 0, path: "/" });
}

/**
 * Obtiene el token de sesión desde las cookies de la petición.
 */
export async function getSessionCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}
