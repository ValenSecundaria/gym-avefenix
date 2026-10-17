"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { loginSchema, type LoginInput } from "@/lib/validations/auth.schema";
import {
  AUTH_UNAVAILABLE_CODE,
  OFFLINE_RESUME_MAX_AGE_MS,
  SESSION_ALIVE_COOKIE,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/auth-constants";
import { signSessionToken, verifySessionToken } from "@/lib/auth/session-token";
import type { ActionResponse } from "@/types";
import type { AuthenticatedUser, AuthSessionResult } from "@/types/auth";

export interface LoginCredentials {
  username?: string;
  password?: string;
}

async function ensureDefaultAdminExists(): Promise<void> {
  try {
    const existingAdmin = await prisma.user.findFirst({
      where: {
        username: {
          equals: "admin",
          mode: "insensitive",
        },
      },
    });
    if (!existingAdmin) {
      const defaultPassword = process.env.ADMIN_INITIAL_PASSWORD || "admin123";
      const passwordHash = await bcrypt.hash(defaultPassword, 10);
      await prisma.user.create({
        data: {
          username: "admin",
          passwordHash,
          name: "Administrador AveFenix",
        },
      });
    }
  } catch (error) {
    console.warn("[ensureDefaultAdminExists] Advertencia al sincronizar admin:", error);
  }
}

/**
 * Emite las cookies de sesión SIN Max-Age/Expires: el navegador las descarta al cerrarse su proceso,
 * lo que ocurre al apagar el equipo o cerrar la sesión de Windows.
 */
async function issueSessionCookies(user: AuthenticatedUser): Promise<AuthSessionResult> {
  const issuedAt = Date.now();
  const sessionToken = await signSessionToken(user, issuedAt);
  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === "production";
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, { httpOnly: true, sameSite: "lax", path: "/", secure });
  cookieStore.set(SESSION_ALIVE_COOKIE, "1", { httpOnly: false, sameSite: "lax", path: "/", secure });
  return { user, sessionToken, issuedAt };
}

/**
 * Server action principal de autenticación:
 * 1. Hardcode / acceso directo de pruebas con nick 'admin' y contraseña 'admin123'
 * 2. Validación de usuarios en PostgreSQL (Superadmin, avefenix, etc.) con bcrypt
 * 3. Emisión de cookies firmadas compatibles con proxy y SessionGuard
 */
export async function authenticateUser(
  input: LoginInput | LoginCredentials
): Promise<ActionResponse<AuthSessionResult>> {
  try {
    const username = (input?.username ?? "").trim();
    const password = input?.password ?? "";

    if (!username || !password) {
      return {
        success: false,
        error: "Credenciales inválidas",
      };
    }

    // Paso A (Hardcode / Acceso rápido de pruebas: admin / admin123):
    if (username.toLowerCase() === "admin" && password === "admin123") {
      let adminUser: AuthenticatedUser | null = null;
      try {
        const dbAdmin = await prisma.user.findFirst({
          where: {
            username: {
              equals: "admin",
              mode: "insensitive",
            },
          },
        });

        if (dbAdmin) {
          adminUser = {
            id: dbAdmin.id,
            username: dbAdmin.username,
            name: dbAdmin.name,
          };
        } else {
          const passwordHash = await bcrypt.hash("admin123", 10);
          const created = await prisma.user.create({
            data: {
              username: "admin",
              passwordHash,
              name: "Administrador AveFenix",
            },
          });
          adminUser = {
            id: created.id,
            username: created.username,
            name: created.name,
          };
        }
      } catch (dbError) {
        console.warn("[authenticateUser] Acceso admin fallback (DB no disponible):", dbError);
        adminUser = {
          id: "admin-master-id",
          username: "admin",
          name: "Administrador AveFenix",
        };
      }

      const session = await issueSessionCookies(adminUser);
      return {
        success: true,
        data: session,
      };
    }

    // Sincronizar admin por defecto en base de datos si no existe
    await ensureDefaultAdminExists();

    // Paso B (Validación contra DB remota):
    let user = null;
    try {
      user = await prisma.user.findFirst({
        where: {
          username: {
            equals: username,
            mode: "insensitive",
          },
        },
      });
    } catch (dbError) {
      console.error("[authenticateUser] Error al consultar DB:", dbError);
      return {
        success: false,
        code: AUTH_UNAVAILABLE_CODE,
        error: "Error interno al iniciar sesión. Verifique la conexión a la base de datos.",
      };
    }

    if (!user) {
      return {
        success: false,
        error: "Credenciales inválidas",
      };
    }

    // Paso C (Verificación de hash):
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return {
        success: false,
        error: "Credenciales inválidas",
      };
    }

    // Paso D (Retorno exitoso con emisión de cookies de sesión firmadas):
    const authenticatedUser: AuthenticatedUser = {
      id: user.id,
      username: user.username,
      name: user.name,
    };

    const session = await issueSessionCookies(authenticatedUser);
    return {
      success: true,
      data: session,
    };
  } catch (error) {
    console.error("[authenticateUser] Error:", error);
    return {
      success: false,
      code: AUTH_UNAVAILABLE_CODE,
      error: "Error interno al iniciar sesión. Verifique la conexión a la base de datos.",
    };
  }
}

/**
 * Server action de inicio de sesión con soporte para:
 * 1. Hardcode de pruebas (admin / admin123)
 * 2. SuperAdmin y avefenix consultados en PostgreSQL con bcrypt.compare
 * Retorna AuthenticatedUser directamente para compatibilidad entre ramas.
 */
export async function loginAction(
  credentials: LoginCredentials
): Promise<ActionResponse<AuthenticatedUser>> {
  const res = await authenticateUser(credentials);
  if (!res.success || !res.data) {
    return {
      success: false,
      error: res.error,
      code: res.code,
    };
  }
  return {
    success: true,
    data: res.data.user,
  };
}

async function setSessionCookie(user: AuthenticatedUser): Promise<void> {
  await issueSessionCookies(user);
}

/**
 * Re-emite la cookie de sesión a partir de un token firmado previamente por el servidor.
 * Se usa al volver internet tras un ingreso offline (validado localmente contra la caché segura).
 */
export async function resumeSession(sessionToken: string): Promise<ActionResponse<AuthSessionResult>> {
  try {
    const payload = await verifySessionToken(sessionToken, OFFLINE_RESUME_MAX_AGE_MS);
    if (!payload) {
      return { success: false, error: "La sesión guardada expiró. Ingresá nuevamente." };
    }
    const session = await issueSessionCookies({ id: payload.id, username: payload.username, name: payload.name });
    return { success: true, data: session };
  } catch (error) {
    console.error("[resumeSession] Error:", error);
    return { success: false, code: AUTH_UNAVAILABLE_CODE, error: "No se pudo reanudar la sesión" };
  }
}

export async function logoutUser(): Promise<ActionResponse<null>> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
    cookieStore.delete(SESSION_ALIVE_COOKIE);
    cookieStore.set(SESSION_COOKIE_NAME, "", { maxAge: 0, path: "/" });
    cookieStore.set(SESSION_ALIVE_COOKIE, "", { maxAge: 0, path: "/" });
    return { success: true, data: null };
  } catch (error) {
    console.error("[logoutUser] Error:", error);
    return {
      success: false,
      error: "No se pudo cerrar la sesión",
    };
  }
}

export async function getSessionUser(): Promise<ActionResponse<AuthenticatedUser | null>> {
  try {
    const cookieStore = await cookies();
    const payload = await verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
    if (!payload) {
      return { success: true, data: null };
    }
    return { success: true, data: { id: payload.id, username: payload.username, name: payload.name } };
  } catch {
    return { success: true, data: null };
  }
}
