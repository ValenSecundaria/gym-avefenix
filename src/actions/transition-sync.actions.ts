"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getActionSession } from "@/lib/auth/require-session";
import { fetchSingleMemberAction } from "@/actions/sync.actions";
import type { ActionResponse, CachedMember } from "@/types";

// TODO [TEMPORARY-TRANSITION]: Eliminar esta Server Action al finalizar el primer mes
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DEFAULT_DAYS = 30;

const syncPeriodSchema = z.object({
  memberId: z.string().min(1, "ID de socio requerido"),
  daysToAdd: z.number().int().positive().max(365).optional().default(DEFAULT_DAYS),
});

export interface SyncInitialPeriodResult {
  memberId: string;
  dni: string;
  fullName: string;
  validUntil: string;
  status: "ACTIVA";
  cached: CachedMember | null;
}

/**
 * Server Action temporal para regularizar socios de la carga inicial.
 * Extiende la membresía sumando 30 días (Math.max(validUntil, now) + daysToAdd) y la marca ACTIVA.
 * CERO impacto en caja: NO crea ningún registro en Payment.
 * Autorizado para roles ADMIN, PROFESOR y RECEPCION.
 */
export async function syncInitialMemberPeriodAction(
  input: { memberId: string; daysToAdd?: number }
): Promise<ActionResponse<SyncInitialPeriodResult>> {
  try {
    const session = await getActionSession();
    if (!session) {
      return { success: false, error: "Tu sesión expiró. Volvé a iniciar sesión." };
    }

    const parsed = syncPeriodSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Datos inválidos" };
    }

    const { memberId, daysToAdd } = parsed.data;

    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: {
        memberships: { orderBy: { validUntil: "desc" }, take: 1, include: { plan: true } },
      },
    });

    if (!member) {
      return { success: false, error: "El socio indicado no existe en la base de datos" };
    }

    const currentMembership = member.memberships[0];
    const now = new Date();
    const baseDate = currentMembership && currentMembership.validUntil > now ? currentMembership.validUntil : now;
    const newValidUntil = new Date(baseDate.getTime() + daysToAdd * MS_PER_DAY);

    const updatedMembership = currentMembership
      ? await prisma.membership.update({
          where: { id: currentMembership.id },
          data: { validUntil: newValidUntil, status: "ACTIVA" },
        })
      : await (async () => {
          const defaultPlan = await prisma.plan.findFirst({ orderBy: { createdAt: "asc" } });
          if (!defaultPlan) throw new Error("No hay planes configurados en el sistema");
          return prisma.membership.create({
            data: {
              memberId: member.id,
              planId: defaultPlan.id,
              startDate: now,
              validUntil: newValidUntil,
              status: "ACTIVA",
            },
          });
        })();

    if (!member.isActive) {
      await prisma.member.update({ where: { id: member.id }, data: { isActive: true } });
    }

    // Actualiza la caché local del molinete para reflejar el estado HABILITADO
    const cachedRes = await fetchSingleMemberAction(member.dni);

    revalidatePath("/admin");
    revalidatePath("/profesor");

    return {
      success: true,
      data: {
        memberId: member.id,
        dni: member.dni,
        fullName: member.fullName,
        validUntil: updatedMembership.validUntil.toISOString(),
        status: "ACTIVA",
        cached: cachedRes.success && cachedRes.data ? cachedRes.data : null,
      },
    };
  } catch (error) {
    console.error("[syncInitialMemberPeriodAction] Error:", error);
    return { success: false, error: "No se pudo regularizar el período del socio." };
  }
}
