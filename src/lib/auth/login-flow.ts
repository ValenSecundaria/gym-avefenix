// Orquestación del login y de la restauración de sesión (sólo cliente).
import { authenticateUser, getSessionUser, resumeSession } from "@/actions/auth.actions";
import type { ClientSession, LoginOutcome } from "@/types/auth";
import { AUTH_UNAVAILABLE_CODE } from "./auth-constants";
import {
  clearClientSession,
  discardStaleReplica,
  hasAliveCookie,
  persistClientSession,
  readReplicatedSession,
  readWindowSession,
} from "./client-session";
import { cacheOfflineCredentials, verifyOfflineCredentials } from "./offline-credentials";

const INVALID_CREDENTIALS = "Usuario o contraseña incorrectos";

function isOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

async function loginOffline(username: string, password: string): Promise<LoginOutcome> {
  const verification = await verifyOfflineCredentials(username, password);
  if (verification.status === "INVALID_PASSWORD") return { ok: false, error: INVALID_CREDENTIALS };
  if (verification.status === "NOT_CACHED") {
    return {
      ok: false,
      error: "Sin conexión con el servidor y este usuario aún no tiene un ingreso validado en este equipo.",
    };
  }
  const session: ClientSession = {
    user: verification.record.user,
    token: verification.record.lastToken,
    mode: "offline",
    authenticatedAt: Date.now(),
  };
  await persistClientSession(session);
  return { ok: true, session };
}

/** Valida contra la Server Action (bcrypt en BD); si no hay red/servidor, contra la caché local segura. */
export async function loginWithOfflineFallback(username: string, password: string): Promise<LoginOutcome> {
  if (isOffline()) return loginOffline(username, password);
  try {
    const res = await authenticateUser({ username, password });
    if (res.success && res.data) {
      const session: ClientSession = {
        user: res.data.user,
        token: res.data.sessionToken,
        mode: "online",
        authenticatedAt: res.data.issuedAt,
      };
      await persistClientSession(session);
      await cacheOfflineCredentials(username, password, res.data.user, res.data.sessionToken);
      return { ok: true, session };
    }
    if (res.code !== AUTH_UNAVAILABLE_CODE) return { ok: false, error: res.error || INVALID_CREDENTIALS };
  } catch {
    // Error de red (internet caído / servidor inaccesible): se intenta el ingreso offline.
  }
  return loginOffline(username, password);
}

export type ResumeResult = ClientSession | "NETWORK" | "REJECTED";

/** Re-emite la cookie del servidor para una sesión iniciada offline, cuando vuelve la conexión. */
export async function resumeOfflineSession(session: ClientSession): Promise<ResumeResult> {
  if (!session.token) return "REJECTED";
  try {
    const res = await resumeSession(session.token);
    if (res.success && res.data) {
      const resumed: ClientSession = { ...session, token: res.data.sessionToken, mode: "online" };
      await persistClientSession(resumed);
      return resumed;
    }
    return res.code === AUTH_UNAVAILABLE_CODE ? "NETWORK" : "REJECTED";
  } catch {
    return "NETWORK";
  }
}

async function adoptServerCookieSession(): Promise<ClientSession | null> {
  if (isOffline()) return null;
  try {
    const res = await getSessionUser();
    if (!res.success || !res.data) return null;
    const session: ClientSession = { user: res.data, token: null, mode: "online", authenticatedAt: Date.now() };
    await persistClientSession(session);
    return session;
  } catch {
    return null;
  }
}

/**
 * Restaura la sesión al cargar cualquier ventana:
 * 1) sessionStorage de la ventana → 2) réplica IndexedDB si el navegador sigue vivo (cookie testigo)
 * → 3) cookie httpOnly del servidor. Si la cookie testigo no existe, el equipo se reinició: se descarta la réplica.
 */
export async function restoreClientSession(): Promise<ClientSession | null> {
  const fromWindow = readWindowSession();
  if (fromWindow) return fromWindow;

  if (!hasAliveCookie()) {
    await discardStaleReplica();
    return null;
  }

  const replica = await readReplicatedSession();
  if (replica) {
    await persistClientSession(replica);
    return replica;
  }
  return adoptServerCookieSession();
}

/**
 * Antes de saltar del login a las rutas protegidas, garantiza que el servidor también reconozca la sesión
 * (si no, proxy.ts devolvería a /login en bucle). Sin red, la sesión local alcanza: el SW sirve la caché.
 */
export async function ensureServerSession(session: ClientSession): Promise<ClientSession | null> {
  if (isOffline()) return session;
  try {
    const res = await getSessionUser();
    if (res.success && res.data?.id === session.user.id) return session;
  } catch {
    return session;
  }
  const resumed = await resumeOfflineSession(session);
  if (resumed === "NETWORK") return session;
  if (resumed === "REJECTED") {
    await clearClientSession();
    return null;
  }
  return resumed;
}

export { clearClientSession };
