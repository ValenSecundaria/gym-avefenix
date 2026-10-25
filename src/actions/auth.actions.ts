"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema, type LoginInput } from "@/lib/validations/auth.schema";
import { AUTH_UNAVAILABLE_CODE, OFFLINE_RESUME_MAX_AGE_MS } from "@/lib/auth/auth-constants";
import { verifySessionToken } from "@/lib/auth/session-token";
import { issueSessionCookies, clearSessionCookies, getSessionCookie } from "@/lib/auth/session-cookie";
import { getDevAdminUser } from "@/lib/auth/dev-admin";
import type { ActionResponse } from "@/types";
import type { AuthenticatedUser, AuthSessionResult } from "@/types/auth";

export interface LoginCredentials {
  username?: string;
  password?: string;
}

/**
 * Server action principal de autenticación:
 * 1. Validación de esquema con loginSchema (Zod).
 * 2. Bypass exclusivo en desarrollo para usuario admin.
 * 3. Validación contra PostgreSQL y bcrypt.
 * 4. Emisión de cookies firmadas de sesión.
 */
export async function authenticateUser(
  input: LoginInput | LoginCredentials
): Promise<ActionResponse<AuthSessionResult>> {
  try {
    const validation = loginSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: "Credenciales inválidas" };
    }

    const { username, password } = validation.data;

    // Bypass exclusivo en desarrollo para la cuenta de pruebas
    if (process.env.NODE_ENV === "development" && username === "admin" && password === "admin123") {
      const adminUser = await getDevAdminUser();
      const session = await issueSessionCookies(adminUser);
      return { success: true, data: session };
    }

    let user = null;
    try {
      user = await prisma.user.findFirst({
        where: { username: { equals: username, mode: "insensitive" } },
      });
    } catch (dbError) {
      console.error("[authenticateUser] Error al consultar DB:", dbError);
      return {
        success: false,
        code: AUTH_UNAVAILABLE_CODE,
        error: "Error interno al iniciar sesión. Verifique la conexión a la base de datos.",
      };
    }

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return { success: false, error: "Credenciales inválidas" };
    }

    const authenticatedUser: AuthenticatedUser = {
      id: user.id,
      username: user.username,
      name: user.name,
      gymPhone: user.gymPhone ?? "5492915768403",
    };

    const session = await issueSessionCookies(authenticatedUser);
    return { success: true, data: session };
  } catch (error) {
    console.error("[authenticateUser] Error:", error);
    return {
      success: false,
      code: AUTH_UNAVAILABLE_CODE,
      error: "Error interno al iniciar sesión. Verifique la conexión a la base de datos.",
    };
  }
}

/** Server action de login que retorna AuthenticatedUser directamente. */
export async function loginAction(
  credentials: LoginCredentials
): Promise<ActionResponse<AuthenticatedUser>> {
  const res = await authenticateUser(credentials);
  if (!res.success || !res.data) {
    return { success: false, error: res.error, code: res.code };
  }
  return { success: true, data: res.data.user };
}

/** Re-emite la cookie de sesión a partir de un token firmado previamente por el servidor. */
export async function resumeSession(sessionToken: string): Promise<ActionResponse<AuthSessionResult>> {
  try {
    const payload = await verifySessionToken(sessionToken, OFFLINE_RESUME_MAX_AGE_MS);
    if (!payload) {
      return { success: false, error: "La sesión guardada expiró. Ingresá nuevamente." };
    }
    const session = await issueSessionCookies({
      id: payload.id,
      username: payload.username,
      name: payload.name,
      gymPhone: payload.gymPhone ?? "5492915768403",
    });
    return { success: true, data: session };
  } catch (error) {
    console.error("[resumeSession] Error:", error);
    return { success: false, code: AUTH_UNAVAILABLE_CODE, error: "No se pudo reanudar la sesión" };
  }
}

/** Cierra la sesión activa eliminando las cookies del cliente. */
export async function logoutUser(): Promise<ActionResponse<null>> {
  try {
    await clearSessionCookies();
    return { success: true, data: null };
  } catch (error) {
    console.error("[logoutUser] Error:", error);
    return { success: false, error: "No se pudo cerrar la sesión" };
  }
}

/** Obtiene el usuario autenticado actualmente a partir de la cookie de sesión. */
export async function getSessionUser(): Promise<ActionResponse<AuthenticatedUser | null>> {
  try {
    const token = await getSessionCookie();
    const payload = await verifySessionToken(token);
    if (!payload) {
      return { success: true, data: null };
    }
    return {
      success: true,
      data: {
        id: payload.id,
        username: payload.username,
        name: payload.name,
        gymPhone: payload.gymPhone ?? "5492915768403",
      },
    };
  } catch {
    return { success: true, data: null };
  }
}
