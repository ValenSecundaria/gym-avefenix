"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { formatShift } from "@/lib/shifts/shift-formatter";
import { autoCloseExpiredShifts } from "@/lib/shifts/auto-close-shifts";
import type { ActionResponse, TeacherShiftItem, ToggleShiftResult } from "@/types";

const identifierSchema = z.object({
  userId: z.string().trim().min(1).optional(),
  dni: z.string().trim().min(6).max(12).optional(),
});

export async function toggleTeacherShiftAction(
  identifier: { userId?: string; dni?: string }
): Promise<ActionResponse<ToggleShiftResult>> {
  try {
    await autoCloseExpiredShifts();
    const parsed = identifierSchema.safeParse(identifier);
    if (!parsed.success || (!parsed.data.userId && !parsed.data.dni)) {
      return { success: false, error: "Identificador de profesor inválido" };
    }
    const { userId, dni } = parsed.data;

    const user = await prisma.user.findFirst({
      where: userId ? { id: userId } : { dni: dni! },
      select: { id: true, name: true, role: true, dni: true },
    });

    if (!user || user.role !== "PROFESOR") {
      return { success: false, error: "No se encontró ningún profesor registrado con ese identificador" };
    }

    const openShift = await prisma.teacherShift.findFirst({
      where: { userId: user.id, checkOut: null },
      orderBy: { checkIn: "desc" },
    });

    if (!openShift) {
      const now = new Date();
      const newShift = await prisma.teacherShift.create({
        data: { userId: user.id, checkIn: now, checkOut: null },
        include: { user: { select: { name: true, dni: true } } },
      });
      return {
        success: true,
        data: { action: "CHECK_IN", shift: formatShift(newShift), teacherName: user.name },
      };
    }

    const checkOut = new Date();
    const diffMs = Math.max(0, checkOut.getTime() - openShift.checkIn.getTime());
    const totalMinutes = Math.round(diffMs / 60000);

    const updated = await prisma.teacherShift.update({
      where: { id: openShift.id },
      data: { checkOut, totalMinutes },
      include: { user: { select: { name: true, dni: true } } },
    });

    return {
      success: true,
      data: {
        action: "CHECK_OUT",
        shift: formatShift(updated),
        totalMinutes,
        teacherName: user.name,
      },
    };
  } catch (error) {
    console.error("[toggleTeacherShiftAction] Error:", error);
    return { success: false, error: "No se pudo registrar la asistencia del profesor" };
  }
}

export async function getActiveTeacherShiftAction(userId: string): Promise<ActionResponse<TeacherShiftItem | null>> {
  try {
    await autoCloseExpiredShifts();
    const shift = await prisma.teacherShift.findFirst({
      where: { userId, checkOut: null },
      orderBy: { checkIn: "desc" },
      include: { user: { select: { name: true, dni: true } } },
    });
    return { success: true, data: shift ? formatShift(shift) : null };
  } catch (error) {
    console.error("[getActiveTeacherShiftAction] Error:", error);
    return { success: false, error: "No se pudo verificar el turno activo" };
  }
}
