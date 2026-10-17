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

async function ensureDefaultAdminExists(): Promise<void> {
  const userCount = await prisma.user.count();
  if (userCount === 0) {
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

export async function authenticateUser(
  input: LoginInput
): Promise<ActionResponse<AuthSessionResult>> {
  try {
    const parsed = loginSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Credenciales inválidas",
      };
    }

    await ensureDefaultAdminExists();

    const { username, password } = parsed.data;
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return {
        success: false,
        error: "Usuario o contraseña incorrectos",
      };
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return {
        success: false,
        error: "Usuario o contraseña incorrectos",
      };
    }

    const session = await issueSessionCookies({ id: user.id, username: user.username, name: user.name });
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
