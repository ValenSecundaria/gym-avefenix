"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hasAdminSession } from "@/lib/auth/require-session";
import { formatShift } from "@/lib/shifts/shift-formatter";
import { autoCloseExpiredShifts } from "@/lib/shifts/auto-close-shifts";
import type { ActionResponse, TeacherShiftItem } from "@/types";

export async function getTeacherShiftsAction(filter: {
  userId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<ActionResponse<TeacherShiftItem[]>> {
  try {
    await autoCloseExpiredShifts();
    const where: Record<string, unknown> = {};
    if (filter.userId) where.userId = filter.userId;
    if (filter.startDate || filter.endDate) {
      where.checkIn = {
        ...(filter.startDate ? { gte: new Date(filter.startDate) } : {}),
        ...(filter.endDate ? { lte: new Date(filter.endDate) } : {}),
      };
    }

    const shifts = await prisma.teacherShift.findMany({
      where,
      orderBy: { checkIn: "desc" },
      take: 300,
      include: { user: { select: { name: true, dni: true } } },
    });

    return { success: true, data: shifts.map(formatShift) };
  } catch (error) {
    console.error("[getTeacherShiftsAction] Error:", error);
    return { success: false, error: "No se pudieron obtener los turnos" };
  }
}

/** Turnos abiertos ahora (de cualquier fecha): quién está "En turno", aunque haya entrado otro mes. */
export async function getActiveShiftsAction(): Promise<ActionResponse<TeacherShiftItem[]>> {
  try {
    if (!(await hasAdminSession())) return { success: false, error: "Sesión expirada" };
    await autoCloseExpiredShifts();
    const shifts = await prisma.teacherShift.findMany({
      where: { checkOut: null },
      orderBy: { checkIn: "asc" },
      include: { user: { select: { name: true, dni: true } } },
    });
    return { success: true, data: shifts.map(formatShift) };
  } catch (error) {
    console.error("[getActiveShiftsAction] Error:", error);
    return { success: false, error: "No se pudieron obtener los turnos en curso" };
  }
}

const manualShiftSchema = z.object({
  userId: z.string().trim().min(1, "Seleccioná un profesor"),
  checkIn: z.string().datetime({ message: "Fecha/hora de entrada inválida" }),
  checkOut: z.string().datetime({ message: "Fecha/hora de salida inválida" }).optional().nullable(),
  notes: z.string().trim().max(250).optional(),
});

export async function manualShiftAction(input: {
  userId: string;
  checkIn: string;
  checkOut?: string | null;
  notes?: string;
}): Promise<ActionResponse<TeacherShiftItem>> {
  try {
    if (!(await hasAdminSession())) return { success: false, error: "Sesión expirada" };
    const parsed = manualShiftSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message || "Datos inválidos" };

    const inDate = new Date(parsed.data.checkIn);
    if (inDate.getTime() > Date.now()) {
      return { success: false, error: "El horario de ingreso no puede ser posterior a la hora actual" };
    }

    let outDate: Date | null = null;
    let totalMinutes: number | null = null;

    if (parsed.data.checkOut) {
      outDate = new Date(parsed.data.checkOut);
      if (outDate <= inDate) return { success: false, error: "La salida debe ser posterior a la entrada" };
      totalMinutes = Math.round((outDate.getTime() - inDate.getTime()) / 60000);
    }

    const userId = parsed.data.userId;
    const shift = await prisma.$transaction(async (tx) => {
      // Mismo candado que el fichaje del profesor: no puede quedar con dos turnos abiertos.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${userId}))`;
      const active = await tx.teacherShift.findFirst({ where: { userId, checkOut: null } });
      if (active) return null;
      return tx.teacherShift.create({
        data: {
          userId,
          checkIn: inDate,
          checkOut: outDate,
          totalMinutes,
          notes: parsed.data.notes || null,
        },
        include: { user: { select: { name: true, dni: true } } },
      });
    });

    if (!shift) {
      return { success: false, error: "El profesor ya está en turno: solo se le puede marcar la salida" };
    }
    return { success: true, data: formatShift(shift) };
  } catch (error) {
    console.error("[manualShiftAction] Error:", error);
    return { success: false, error: "No se pudo registrar el turno manual" };
  }
}

export async function closeTeacherShiftAction(shiftId: string): Promise<ActionResponse<TeacherShiftItem>> {
  try {
    if (!(await hasAdminSession())) return { success: false, error: "Sesión expirada" };
    const existing = await prisma.teacherShift.findUnique({ where: { id: shiftId } });
    if (!existing) return { success: false, error: "Turno no encontrado" };
    if (existing.checkOut) return { success: false, error: "El turno ya fue cerrado" };

    const now = new Date();
    const diffMs = Math.max(0, now.getTime() - existing.checkIn.getTime());
    const totalMinutes = Math.round(diffMs / 60000);

    const updated = await prisma.teacherShift.update({
      where: { id: shiftId },
      data: { checkOut: now, totalMinutes },
      include: { user: { select: { name: true, dni: true } } },
    });

    return { success: true, data: formatShift(updated) };
  } catch (error) {
    console.error("[closeTeacherShiftAction] Error:", error);
    return { success: false, error: "No se pudo cerrar el turno del profesor" };
  }
}

export async function deleteShiftAction(shiftId: string): Promise<ActionResponse<{ id: string }>> {
  try {
    if (!(await hasAdminSession())) return { success: false, error: "Sesión expirada" };
    await prisma.teacherShift.delete({ where: { id: shiftId } });
    return { success: true, data: { id: shiftId } };
  } catch (error) {
    console.error("[deleteShiftAction] Error:", error);
    return { success: false, error: "No se pudo eliminar el turno" };
  }
}
