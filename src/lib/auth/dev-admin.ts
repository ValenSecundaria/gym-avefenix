import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { AuthenticatedUser } from "@/types/auth";

/**
 * Obtiene o inicializa el usuario de prueba exclusivo para entorno de desarrollo.
 * Si la base de datos no está disponible, retorna un usuario fallback en memoria.
 */
export async function getDevAdminUser(): Promise<AuthenticatedUser> {
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
      return {
        id: dbAdmin.id,
        username: dbAdmin.username,
        name: dbAdmin.name,
        gymPhone: dbAdmin.gymPhone ?? "5492915768403",
      };
    }

    const defaultPassword = process.env.ADMIN_INITIAL_PASSWORD || "admin123";
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    const created = await prisma.user.create({
      data: {
        username: "admin",
        passwordHash,
        name: "Administrador AveFenix",
        gymPhone: "5492915768403",
      },
    });

    return {
      id: created.id,
      username: created.username,
      name: created.name,
      gymPhone: created.gymPhone ?? "5492915768403",
    };
  } catch (dbError) {
    console.warn("[getDevAdminUser] Acceso admin fallback (DB no disponible en desarrollo):", dbError);
    return {
      id: "admin-master-id",
      username: "admin",
      name: "Administrador AveFenix",
      gymPhone: "5492915768403",
    };
  }
}
