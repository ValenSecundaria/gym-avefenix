"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getMemberPhotoUrl, getStartOfWeekMonday } from "@/lib/utils";
import { checkInDniSchema } from "@/lib/validations/checkin.schema";
import type {
  AccessStatusType,
  ActionResponse,
  CheckInVerificationResult,
  LiveCheckInItem,
} from "@/types";

export async function verifyAndCheckIn(
  dniInput: string | { dni: string }
): Promise<ActionResponse<CheckInVerificationResult>> {
  try {
    const rawDni = typeof dniInput === "string" ? dniInput : dniInput?.dni || "";
    const parsed = checkInDniSchema.safeParse({ dni: rawDni });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Formato de DNI inválido" };
    }

    const { dni } = parsed.data;
    const member = await prisma.member.findUnique({
      where: { dni },
      include: {
        memberships: { orderBy: { validUntil: "desc" }, take: 1, include: { plan: true } },
      },
    });

    if (!member) {
      return { success: false, error: `No se encontró ningún socio registrado con el DNI ${dni}` };
    }

    const now = new Date();
    const latestMembership = member.memberships[0];
    const plan = latestMembership?.plan;

    const startOfWeek = getStartOfWeekMonday(now);
    const weeklyCheckInsCount = await prisma.checkIn.count({
      where: {
        memberId: member.id,
        status: "HABILITADO",
        createdAt: { gte: startOfWeek },
      },
    });

    let accessStatus: AccessStatusType = "HABILITADO";

    if (!latestMembership || latestMembership.status !== "ACTIVA" || latestMembership.validUntil < now) {
      accessStatus = "CUOTA_VENCIDA";
      if (latestMembership && latestMembership.status === "ACTIVA") {
        await prisma.membership.update({
          where: { id: latestMembership.id },
          data: { status: "VENCIDA" },
        });
      }
    } else if (
      plan?.allowedDaysPerWeek !== null &&
      plan?.allowedDaysPerWeek !== undefined &&
      weeklyCheckInsCount >= plan.allowedDaysPerWeek
    ) {
      accessStatus = "LIMITE_ALCANZADO";
    }

    const checkInRecord = await prisma.checkIn.create({
      data: { memberId: member.id, status: accessStatus, isSynced: true },
    });

    revalidatePath("/admin");

    const finalDaysUsed = accessStatus === "HABILITADO" ? weeklyCheckInsCount + 1 : weeklyCheckInsCount;

    return {
      success: true,
      data: {
        memberId: member.id,
        dni: member.dni,
        fullName: member.fullName,
        photoUrl: getMemberPhotoUrl(member.dni, member.photoFilename),
        status: accessStatus,
        planName: plan?.name || "Sin plan asignado",
        validUntil: latestMembership ? latestMembership.validUntil.toISOString() : null,
        daysUsedThisWeek: finalDaysUsed,
        allowedDaysPerWeek: plan?.allowedDaysPerWeek ?? null,
        checkedInAt: checkInRecord.createdAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("[verifyAndCheckIn] Error:", error);
    return { success: false, error: "Error al verificar el acceso del socio. Intente nuevamente." };
  }
}

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
