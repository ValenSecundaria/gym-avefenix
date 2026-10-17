"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { loginSchema, type LoginInput } from "@/lib/validations/auth.schema";
import type { ActionResponse } from "@/types";

const SESSION_COOKIE_NAME = "avefenix_session";

export interface AuthenticatedUser {
  id: string;
  username: string;
  name: string;
}

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

export async function authenticateUser(
  input: LoginInput
): Promise<ActionResponse<AuthenticatedUser>> {
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

    const sessionPayload: AuthenticatedUser = {
      id: user.id,
      username: user.username,
      name: user.name,
    };

    const cookieStore = await cookies();
    cookieStore.set(
      SESSION_COOKIE_NAME,
      Buffer.from(JSON.stringify(sessionPayload)).toString("base64"),
      {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 días
      }
    );

    return {
      success: true,
      data: sessionPayload,
    };
  } catch (error) {
    console.error("[authenticateUser] Error:", error);
    return {
      success: false,
      error: "Error interno al iniciar sesión. Verifique la conexión a la base de datos.",
    };
  }
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
