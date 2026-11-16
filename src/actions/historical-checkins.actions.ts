"use server";

import { prisma } from "@/lib/prisma";
import { getMemberPhotoUrl } from "@/lib/utils";
import { getActionSession } from "@/lib/auth/require-session";
import type { ActionResponse } from "@/types";

export interface HistoricalCheckInItem {
  id: string;
  memberId: string;
  dni: string;
  fullName: string;
  photoUrl: string | null;
  planName: string;
  status: "HABILITADO" | "CUOTA_VENCIDA" | "LIMITE_ALCANZADO";
  createdAt: string;
}

export async function getCheckInsByDateAction(
  dateStr: string
): Promise<ActionResponse<HistoricalCheckInItem[]>> {
  try {
    const session = await getActionSession();
    if (!session) {
      return { success: false, error: "Tu sesión expiró. Volvé a iniciar sesión." };
    }

    if (session.role !== "ADMIN") {
      return {
        success: false,
        error: "No autorizado: solo el administrador puede consultar ingresos de días anteriores.",
      };
    }

    // Validar formato YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateStr)) {
      return { success: false, error: "Formato de fecha inválido (debe ser AAAA-MM-DD)." };
    }

    const [year, month, day] = dateStr.split("-").map(Number);
    // Argentina UTC-3: el día calendario corre de 03:00 UTC a 02:59:59.999 UTC del día siguiente
    const startOfDay = new Date(Date.UTC(year, month - 1, day, 3, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month - 1, day + 1, 2, 59, 59, 999));

    const now = new Date();
    if (startOfDay > now) {
      return { success: false, error: "No se pueden consultar ingresos de fechas futuras." };
    }

    const checkIns = await prisma.checkIn.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        member: {
          select: {
            id: true,
            fullName: true,
            dni: true,
            photoFilename: true,
            memberships: {
              orderBy: { createdAt: "desc" },
              take: 1,
              include: {
                plan: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const data: HistoricalCheckInItem[] = checkIns.map((ci) => ({
      id: ci.id,
      memberId: ci.member.id,
      dni: ci.member.dni,
      fullName: ci.member.fullName,
      photoUrl: getMemberPhotoUrl(ci.member.dni, ci.member.photoFilename),
      planName: ci.member.memberships[0]?.plan?.name || "Sin plan",
      status: ci.status,
      createdAt: ci.createdAt.toISOString(),
    }));

    return { success: true, data };
  } catch (error) {
    console.error("[getCheckInsByDateAction] Error:", error);
    return { success: false, error: "Error al consultar los ingresos históricos del día." };
  }
}
