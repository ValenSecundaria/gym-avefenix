"use server";

import { prisma } from "@/lib/prisma";
import { getMemberPhotoUrl } from "@/lib/utils";
import type { ActionResponse, LiveCheckInItem } from "@/types";

export async function getTodayCheckIns(): Promise<ActionResponse<LiveCheckInItem[]>> {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const checkIns = await prisma.checkIn.findMany({
      where: { createdAt: { gte: startOfToday } },
      include: {
        member: {
          include: {
            memberships: { orderBy: { validUntil: "desc" }, take: 1, include: { plan: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 40,
    });

    const data: LiveCheckInItem[] = checkIns.map((ci) => ({
      id: ci.id,
      memberId: ci.memberId,
      dni: ci.member.dni,
      fullName: ci.member.fullName,
      photoUrl: getMemberPhotoUrl(ci.member.dni, ci.member.photoFilename),
      planName: ci.member.memberships[0]?.plan?.name || "Sin plan",
      status: ci.status,
      createdAt: ci.createdAt.toISOString(),
    }));

    return { success: true, data };
  } catch (error) {
    console.error("[getTodayCheckIns] Error:", error);
    return { success: false, error: "No se pudieron obtener los ingresos del día" };
  }
}
