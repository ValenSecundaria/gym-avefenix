"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hasAdminSession } from "@/lib/auth/require-session";
import type { ActionResponse, ProfessorAccountItem } from "@/types";

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
  dni: z.string().trim().min(6, "DNI debe tener entre 6 y 10 dígitos").max(10).optional().or(z.literal("")),
});

const idSchema = z.string().trim().min(1).max(64);

export async function listProfessorAccounts(): Promise<ActionResponse<ProfessorAccountItem[]>> {
  try {
    if (!(await hasAdminSession())) return { success: false, error: NO_SESSION_ERROR };
    const users = await prisma.user.findMany({
      where: { role: "PROFESOR" },
      orderBy: { name: "asc" },
      select: { id: true, name: true, username: true, dni: true, createdAt: true, _count: { select: { paymentsRegistered: true } } },
    });
    return {
      success: true,
      data: users.map((u) => ({
        id: u.id,
        name: u.name,
        username: u.username,
        dni: u.dni,
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
  dni?: string;
}): Promise<ActionResponse<{ name: string }>> {
  try {
    if (!(await hasAdminSession())) return { success: false, error: NO_SESSION_ERROR };
    const parsed = newProfessorSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message || "Datos inválidos" };
    const { name, username, password, dni } = parsed.data;

    const taken = await prisma.user.findFirst({
      where: { username: { equals: username, mode: "insensitive" } },
      select: { id: true },
    });
    if (taken) return { success: false, error: `Ya existe una cuenta con el usuario ${username}` };

    const cleanDni = dni && dni.trim().length > 0 ? dni.trim() : null;
    if (cleanDni) {
      const dniTaken = await prisma.user.findUnique({ where: { dni: cleanDni } });
      if (dniTaken) return { success: false, error: `Ya existe un usuario o profesor con el DNI ${cleanDni}` };
    }

    await prisma.user.create({
      data: { name, username, dni: cleanDni, role: "PROFESOR", passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS) },
    });
    return { success: true, data: { name } };
  } catch (error) {
    console.error("[createProfessorAccount] Error:", error);
    return { success: false, error: "No se pudo crear la cuenta" };
  }
}

export async function updateProfessorDni(userId: string, dni: string | null): Promise<ActionResponse<{ dni: string | null }>> {
  try {
    if (!(await hasAdminSession())) return { success: false, error: NO_SESSION_ERROR };
    const cleanDni = dni && dni.trim().length > 0 ? dni.trim() : null;
    if (cleanDni) {
      const existing = await prisma.user.findFirst({ where: { dni: cleanDni, NOT: { id: userId } } });
      if (existing) return { success: false, error: `El DNI ${cleanDni} ya está asignado a otro usuario.` };
    }
    await prisma.user.update({ where: { id: userId }, data: { dni: cleanDni } });
    return { success: true, data: { dni: cleanDni } };
  } catch (error) {
    console.error("[updateProfessorDni] Error:", error);
    return { success: false, error: "No se pudo actualizar el DNI" };
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
