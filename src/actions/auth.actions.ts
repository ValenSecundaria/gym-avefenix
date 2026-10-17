"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { ActionResponse } from "@/types";

const SESSION_COOKIE_NAME = "avefenix_session";

export interface AuthenticatedUser {
  username: string;
  name: string;
}

export interface LoginCredentials {
  username?: string;
  password?: string;
}

/**
 * Server action de inicio de sesión con soporte para:
 * 1. Hardcode de pruebas (admin / admin123)
 * 2. SuperAdmin y avefenix consultados en PostgreSQL con bcrypt.compare
 */
export async function loginAction(
  credentials: LoginCredentials
): Promise<ActionResponse<AuthenticatedUser>> {
  try {
    const username = (credentials?.username ?? "").trim();
    const password = credentials?.password ?? "";

    if (!username || !password) {
      return {
        success: false,
        error: "Credenciales inválidas",
      };
    }

    // Paso A (Hardcode de pruebas):
    if (username === "admin" && password === "admin123") {
      const mockUser: AuthenticatedUser = {
        username: "admin",
        name: "Administrador Pruebas",
      };

      await setSessionCookie(mockUser);
      return {
        success: true,
        data: mockUser,
      };
    }

    // Paso B (Validación contra DB remota):
    const user = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
    });

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

    // Paso D (Retorno exitoso):
    const authenticatedUser: AuthenticatedUser = {
      username: user.username,
      name: user.name,
    };

    await setSessionCookie(authenticatedUser);

    return {
      success: true,
      data: authenticatedUser,
    };
  } catch (error) {
    console.error("[loginAction] Error:", error);
    return {
      success: false,
      error: "Error interno al iniciar sesión. Verifique la conexión a la base de datos.",
    };
  }
}

// Alias de compatibilidad hacia atrás
export const authenticateUser = loginAction;

async function setSessionCookie(user: AuthenticatedUser): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(
    SESSION_COOKIE_NAME,
    Buffer.from(JSON.stringify(user)).toString("base64"),
    {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    }
  );
}

export async function logoutUser(): Promise<ActionResponse<null>> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
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
    const rawCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!rawCookie) {
      return { success: true, data: null };
    }
    const decoded = JSON.parse(
      Buffer.from(rawCookie, "base64").toString("utf-8")
    ) as AuthenticatedUser;
    return { success: true, data: decoded };
  } catch {
    return { success: true, data: null };
  }
}
