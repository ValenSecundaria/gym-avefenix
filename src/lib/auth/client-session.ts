// Persistencia de la sesión del lado cliente (sólo navegador).
// - sessionStorage: sobrevive a recargas de la ventana.
// - IndexedDB (gym_auth_store/session): réplica para restaurar la sesión en otras ventanas de la app
//   mientras el navegador siga vivo (cookie testigo de sesión presente).
// - Cookie testigo sin Max-Age: desaparece al apagar el equipo / cerrar sesión de Windows; si falta,
//   la réplica en IndexedDB se considera de un arranque anterior y se descarta.
import type { ClientSession } from "@/types/auth";
import { SESSION_ALIVE_COOKIE, SESSION_STORAGE_KEY } from "./auth-constants";
import { idbClear, idbDelete, idbGet, idbPut } from "./idb-store";

const IDB_SESSION_KEY = "active";

function isClientSession(value: unknown): value is ClientSession {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<ClientSession>;
  return Boolean(v.user && typeof v.user.id === "string" && (v.mode === "online" || v.mode === "offline"));
}

export function hasAliveCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((part) => part.trim().startsWith(`${SESSION_ALIVE_COOKIE}=`));
}

function setAliveCookie(): void {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${SESSION_ALIVE_COOKIE}=1; Path=/; SameSite=Lax${secure}`;
}

function clearAliveCookie(): void {
  document.cookie = `${SESSION_ALIVE_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function readWindowSession(): ClientSession | null {
  try {
    const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isClientSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function clearWindowSession(): void {
  try {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    window.sessionStorage.removeItem("avefenix_user");
    window.sessionStorage.removeItem("avefenix_auth_time");
    window.sessionStorage.clear();
  } catch {
    // sessionStorage bloqueado: nada que limpiar.
  }
  try {
    window.localStorage.removeItem("avefenix_terminal_sync");
  } catch {
    // localStorage bloqueado
  }
}

export async function readReplicatedSession(): Promise<ClientSession | null> {
  const stored = await idbGet<unknown>("session", IDB_SESSION_KEY);
  return isClientSession(stored) ? stored : null;
}

/** Marca la sesión como AUTHENTICATED en esta ventana y la replica para el resto del encendido del equipo. */
export async function persistClientSession(session: ClientSession): Promise<void> {
  try {
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Si sessionStorage falla, la réplica en IndexedDB + cookie testigo mantiene la sesión.
  }
  setAliveCookie();
  await idbPut("session", IDB_SESSION_KEY, session);
}

/** Destruye la sesión local (logout manual o réplica de un arranque anterior del equipo). */
export async function clearClientSession(): Promise<void> {
  clearWindowSession();
  clearAliveCookie();
  await idbDelete("session", IDB_SESSION_KEY);
  await idbClear("session");
}

/** Descarta sólo la réplica (cuando la cookie testigo ya no existe porque el equipo se reinició). */
export async function discardStaleReplica(): Promise<void> {
  await idbDelete("session", IDB_SESSION_KEY);
}
