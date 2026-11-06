import { prisma } from "@/lib/prisma";
import { getSessionCookie } from "@/lib/auth/session-cookie";
import { verifySessionToken } from "@/lib/auth/session-token";
import { roleOf } from "@/lib/auth/auth-constants";
import type { SessionTokenPayload, UserRole } from "@/types/auth";

export interface ActionSession extends SessionTokenPayload {
  role: UserRole;
}

/**
 * Sesión de la petición dentro de una Server Action. Las acciones se pueden invocar por POST
 * sin pasar por proxy.ts, así que las que leen, modifican o borran datos deben chequearla ellas mismas.
 * Las cuentas de profesor se confirman contra la base: si la administración la borró, deja de valer al instante.
 */
export async function getActionSession(): Promise<ActionSession | null> {
  const session = await verifySessionToken(await getSessionCookie());
  if (!session) return null;
  const role = roleOf(session);
  if (role === "PROFESOR") {
    const user = await prisma.user.findUnique({ where: { id: session.id }, select: { role: true } });
    if (!user || user.role !== "PROFESOR") return null;
  }
  return { ...session, role };
}

/** Cualquier cuenta con sesión (administración o profesor). */
export async function hasActionSession(): Promise<boolean> {
  return Boolean(await getActionSession());
}

/** Solo administración: planes, caja, historial de pagos, edición y bajas de socios, cuentas. */
export async function hasAdminSession(): Promise<boolean> {
  return (await getActionSession())?.role === "ADMIN";
}
