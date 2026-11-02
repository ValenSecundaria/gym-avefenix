"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hasAdminSession } from "@/lib/auth/require-session";
import type { ActionResponse, ProfessorAccountItem } from "@/types";

// -------------------------------------------------------------
// CUENTAS DE PROFESOR (las administra la cuenta de administración desde Configuración)
// -------------------------------------------------------------

const NO_SESSION_ERROR = "Tu sesión expiró. Volvé a iniciar sesión.";
const BCRYPT_ROUNDS = 10;

const passwordSchema = z
  .string()
  .min(6, "La contraseña debe tener al menos 6 caracteres")
  .max(72, "La contraseña no puede superar los 72 caracteres");

const newProfessorSchema = z.object({
  name: z.string().trim().min(2, "Ingresá el nombre del profesor").max(60, "El nombre es demasiado largo"),
  username: z
    .string()
    .trim()
    .min(3, "El usuario debe tener al menos 3 caracteres")
    .max(30, "El usuario no puede superar los 30 caracteres")
    .regex(/^[a-zA-Z0-9._-]+$/, "El usuario solo puede tener letras, números, punto, guion y guion bajo"),
  password: passwordSchema,
});

const idSchema = z.string().trim().min(1).max(64);

export async function listProfessorAccounts(): Promise<ActionResponse<ProfessorAccountItem[]>> {
  try {
    if (!(await hasAdminSession())) return { success: false, error: NO_SESSION_ERROR };
    const users = await prisma.user.findMany({
      where: { role: "PROFESOR" },
      orderBy: { name: "asc" },
      select: { id: true, name: true, username: true, createdAt: true, _count: { select: { paymentsRegistered: true } } },
    });
    return {
      success: true,
      data: users.map((u) => ({
        id: u.id,
        name: u.name,
        username: u.username,
        createdAt: u.createdAt.toISOString(),
        paymentsCount: u._count.paymentsRegistered,
      })),
    };
  } catch (error) {
    console.error("[listProfessorAccounts] Error:", error);
    return { success: false, error: "No se pudieron cargar las cuentas de profesores" };
  }
}

export async function createProfessorAccount(input: {
  name: string;
  username: string;
  password: string;
}): Promise<ActionResponse<{ name: string }>> {
  try {
    if (!(await hasAdminSession())) return { success: false, error: NO_SESSION_ERROR };
    const parsed = newProfessorSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message || "Datos inválidos" };
    const { name, username, password } = parsed.data;

    // El login no distingue mayúsculas: "Juan" y "juan" serían la misma cuenta.
    const taken = await prisma.user.findFirst({
      where: { username: { equals: username, mode: "insensitive" } },
      select: { id: true },
    });
    if (taken) return { success: false, error: `Ya existe una cuenta con el usuario ${username}` };

    await prisma.user.create({
      data: { name, username, role: "PROFESOR", passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS) },
    });
    return { success: true, data: { name } };
  } catch (error) {
    console.error("[createProfessorAccount] Error:", error);
    return { success: false, error: "No se pudo crear la cuenta" };
  }
}

export async function resetProfessorPassword(userId: string, password: string): Promise<ActionResponse<{ name: string }>> {
  try {
    if (!(await hasAdminSession())) return { success: false, error: NO_SESSION_ERROR };
    const id = idSchema.safeParse(userId);
    const pass = passwordSchema.safeParse(password);
    if (!id.success) return { success: false, error: "Cuenta inválida" };
    if (!pass.success) return { success: false, error: pass.error.issues[0]?.message || "Contraseña inválida" };

    const user = await prisma.user.findFirst({ where: { id: id.data, role: "PROFESOR" }, select: { name: true } });
    if (!user) return { success: false, error: "La cuenta ya no existe" };
    await prisma.user.update({
      where: { id: id.data },
      data: { passwordHash: await bcrypt.hash(pass.data, BCRYPT_ROUNDS) },
    });
    return { success: true, data: user };
  } catch (error) {
    console.error("[resetProfessorPassword] Error:", error);
    return { success: false, error: "No se pudo cambiar la contraseña" };
  }
}

/** Los cobros que registró conservan su nombre (registeredByName). */
export async function deleteProfessorAccount(userId: string): Promise<ActionResponse<{ name: string }>> {
  try {
    if (!(await hasAdminSession())) return { success: false, error: NO_SESSION_ERROR };
    const id = idSchema.safeParse(userId);
    if (!id.success) return { success: false, error: "Cuenta inválida" };

    const user = await prisma.user.findFirst({ where: { id: id.data, role: "PROFESOR" }, select: { name: true } });
    if (!user) return { success: false, error: "La cuenta ya no existe" };
    await prisma.user.delete({ where: { id: id.data } });
    return { success: true, data: user };
  } catch (error) {
    console.error("[deleteProfessorAccount] Error:", error);
    return { success: false, error: "No se pudo borrar la cuenta" };
  }
}
