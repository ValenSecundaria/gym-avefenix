"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getStartOfWeekMonday } from "@/lib/utils";
import { batchCheckInSchema } from "@/lib/validations/sync.schema";
import type { ActionResponse, CachedMember } from "@/types";

export async function getFullMembersCacheAction(): Promise<ActionResponse<CachedMember[]>> {
  try {
    const startOfWeek = getStartOfWeekMonday(new Date());

    const [members, weeklyCheckIns] = await Promise.all([
      prisma.member.findMany({
        where: { isActive: true },
        select: {
          id: true,
          dni: true,
          fullName: true,
          photoFilename: true,
          memberships: {
            where: { status: "ACTIVA" },
            orderBy: { validUntil: "desc" },
            take: 1,
            select: {
              validUntil: true,
              plan: {
                select: {
                  name: true,
                  allowedDaysPerWeek: true,
                },
              },
            },
          },
        },
      }),
      prisma.checkIn.groupBy({
        by: ["memberId"],
        where: {
          status: "HABILITADO",
          createdAt: { gte: startOfWeek },
        },
        _count: { id: true },
      }),
    ]);

    const weeklyMap = new Map<string, number>();
    for (const row of weeklyCheckIns) {
      weeklyMap.set(row.memberId, row._count.id);
    }

    const data: CachedMember[] = members.map((m) => {
      const activeMembership = m.memberships[0];
      return {
        id: m.id,
        dni: m.dni,
        fullName: m.fullName,
        photoFilename: m.photoFilename,
        planName: activeMembership?.plan?.name || "Sin plan activo",
        allowedDays: activeMembership?.plan?.allowedDaysPerWeek ?? null,
        validUntil: activeMembership ? activeMembership.validUntil.toISOString() : null,
        weeklyCheckIns: weeklyMap.get(m.id) || 0,
      };
    });

    return { success: true, data };
  } catch (error) {
    console.error("[getFullMembersCacheAction] Error:", error);
    return { success: false, error: "Error al descargar el catálogo consolidado de socios" };
  }
}

export async function fetchSingleMemberAction(dniInput: string): Promise<ActionResponse<CachedMember>> {
  try {
    const dni = dniInput.trim();
    if (!dni) {
      return { success: false, error: "DNI inválido" };
    }

    const member = await prisma.member.findUnique({
      where: { dni },
      include: {
        memberships: {
          orderBy: { validUntil: "desc" },
          take: 1,
          include: { plan: true },
        },
      },
    });

    if (!member || !member.isActive) {
      return { success: false, error: "Socio no registrado o inactivo" };
    }

    const startOfWeek = getStartOfWeekMonday(new Date());
    const weeklyCheckInsCount = await prisma.checkIn.count({
      where: {
        memberId: member.id,
        status: "HABILITADO",
        createdAt: { gte: startOfWeek },
      },
    });

    const latestMembership = member.memberships[0];
    const data: CachedMember = {
      id: member.id,
      dni: member.dni,
      fullName: member.fullName,
      photoFilename: member.photoFilename,
      planName: latestMembership?.plan?.name || "Sin plan",
      allowedDays: latestMembership?.plan?.allowedDaysPerWeek ?? null,
      validUntil: latestMembership ? latestMembership.validUntil.toISOString() : null,
      weeklyCheckIns: weeklyCheckInsCount,
    };

    return { success: true, data };
  } catch (error) {
    console.error("[fetchSingleMemberAction] Error:", error);
    return { success: false, error: "Error al buscar socio en el servidor" };
  }
}

export async function syncBatchCheckInsAction(
  items: unknown
): Promise<ActionResponse<{ count: number }>> {
  try {
    const parsed = batchCheckInSchema.safeParse(items);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Payload inválido" };
    }

    if (parsed.data.length === 0) {
      return { success: true, data: { count: 0 } };
    }

    const inserted = await prisma.checkIn.createMany({
      data: parsed.data.map((item) => ({
        memberId: item.memberId,
        status: item.status,
        createdAt: new Date(item.createdAt),
        isSynced: true,
      })),
    });

    revalidatePath("/admin");
    return { success: true, data: { count: inserted.count } };
  } catch (error) {
    console.error("[syncBatchCheckInsAction] Error:", error);
    return { success: false, error: "Error al guardar el lote de ingresos" };
  }
}
